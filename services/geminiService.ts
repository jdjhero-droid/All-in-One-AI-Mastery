
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ModelType, AspectRatio, StoryGenerationResult, VeoModel, VeoAspectRatio, VeoResolution, TitleData } from "../types";
import { getApiKey } from "../utils/keyStorage";

/**
 * Helper to initialize the AI client with the preferred key.
 * Prioritizes the user-managed key from local storage.
 */
const getAIClient = (customKey?: string) => {
  const key = customKey || getApiKey() || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please configure it in Settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Validates the provided API key by making a minimal request.
 */
export const testConnection = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: "ping" }] },
    });
    return !!response.text;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const generateStoryStructure = async (
  topic: string,
  referenceImageBase64: string | null,
  sceneCount: number = 10
): Promise<StoryGenerationResult> => {
  const ai = getAIClient();
  const modelId = "gemini-2.5-flash";

  const sceneSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        description: `A list of exactly ${sceneCount} scenes forming a complete story.`,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Korean description." },
            imagePrompt: { type: Type.STRING, description: "Detailed visual description in English." },
            i2vPrompt: { type: Type.STRING, description: "Technical motion prompt in English." },
          },
          required: ["sceneNumber", "description", "imagePrompt", "i2vPrompt"],
        },
      },
      titles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
              english: { type: Type.STRING },
              korean: { type: Type.STRING }
          },
          required: ["english", "korean"]
        }
      }
    },
    required: ["scenes", "titles"],
  };

  const systemInstruction = `
    You are an expert Storyboard AI. Create a story for ${sceneCount} scenes.
    
    IMPORTANT: When a reference image is provided, you must preserve the subject's clothing, face, 
    and background elements EXACTLY across all generated prompts, unless specifically instructed to change them.
    Maintain visual consistency as a top priority.

    Output Constraints:
    1. 'description': Korean.
    2. 'imagePrompt': Detailed visual prompt in English.
    3. 'i2vPrompt': Technical prompt in English.
    4. 'titles': 10 YouTube SEO titles.
  `;

  const parts: any[] = [];
  if (referenceImageBase64) {
    const cleanBase64 = referenceImageBase64.split(',')[1] || referenceImageBase64;
    parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
    parts.push({ text: `REFERENCE IMAGE PROVIDED. MAINTAIN STYLE AND CHARACTER CONSISTENCY. Topic: ${topic}` });
  } else {
    parts.push({ text: `Topic: ${topic}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      const processedScenes = parsed.scenes.map((scene: any) => ({
          ...scene,
          imagePrompt: `A hyper-realistic, documentary-style image. ${scene.imagePrompt}`,
          i2vPrompt: `${scene.i2vPrompt} There is no slow motion, and the scene unfolds quickly.`
      }));
      return { scenes: processedScenes, titles: parsed.titles || [] };
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Story Gen Error:", error);
    throw error;
  }
};

export const generateTitles = async (topic: string): Promise<TitleData[]> => {
  const ai = getAIClient();
  const modelId = "gemini-2.5-flash";
  const titlesSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      titles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { english: { type: Type.STRING }, korean: { type: Type.STRING } },
          required: ["english", "korean"]
        }
      }
    },
    required: ["titles"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: `Generate 10 SEO titles for: ${topic}` }] },
      config: { responseMimeType: "application/json", responseSchema: titlesSchema },
    });
    return JSON.parse(response.text || '{"titles":[]}').titles;
  } catch (error) {
    console.error("Title Error:", error);
    throw error;
  }
};

export const generateSceneImage = async (modelType: ModelType, prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = getAIClient();
  const modelId = modelType === ModelType.NanoBananaPro ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio } }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateVeoVideo = async (modelId: VeoModel, prompt: string, aspectRatio: VeoAspectRatio, resolution: VeoResolution, referenceImageBase64: string | null): Promise<string> => {
    const key = getApiKey() || process.env.API_KEY;
    const ai = getAIClient();
    try {
        const config = { numberOfVideos: 1, resolution, aspectRatio };
        const params: any = { model: modelId, prompt, config };
        if (referenceImageBase64) {
            params.image = { imageBytes: referenceImageBase64.split(',')[1], mimeType: 'image/jpeg' };
        }
        let operation = await ai.models.generateVideos(params);
        while (!operation.done) {
            await new Promise(r => setTimeout(r, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
        }
        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("Video URI not found");
        const response = await fetch(`${videoUri}&key=${key}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error: any) {
        console.error("Veo Error:", error);
        throw error;
    }
};
