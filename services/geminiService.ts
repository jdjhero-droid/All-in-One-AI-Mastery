import { GoogleGenAI, Type } from "@google/genai";
import { ModelType, AspectRatio, StoryGenerationResult, VeoModel, VeoAspectRatio, VeoResolution, TitleData } from "../types.ts";
import { getApiKey } from "../utils/keyStorage.ts";

/**
 * 전역 API 키 및 로컬 저장소 키 통합 관리
 */
const getEffectiveApiKey = (): string => {
  const localKey = getApiKey();
  const systemKey = (window as any).process?.env?.API_KEY || process.env.API_KEY;
  const key = localKey || systemKey;
  if (!key) {
    throw new Error("API Key가 설정되지 않았습니다. 설정에서 API Key를 입력해주세요.");
  }
  return key;
};

/**
 * 이미지 데이터에서 MIME 타입을 추출하는 헬퍼
 */
const getMimeTypeFromDataUrl = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : "image/jpeg";
};

/**
 * AI 응답에서 JSON 문자열만 추출하는 헬퍼
 */
const extractJson = (text: string): string => {
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return jsonMatch ? jsonMatch[0] : text;
};

export const testConnection = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-pro-preview"; 

  const sceneSchema: any = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        description: `A list of exactly ${sceneCount} scenes.`,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "Korean description of the action." },
            imagePrompt: { type: Type.STRING, description: "Highly detailed English visual prompt for image generation." },
            i2vPrompt: { type: Type.STRING, description: "Technical English motion prompt for video generation." },
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

  const systemInstruction = `당신은 세계적으로 명성이 자자한 음악 프로듀서이자 AI 스토리보드 마스터입니다. 
  
  [핵심 미션: 캐릭터 일관성 유지]
  레퍼런스 이미지가 제공된 경우, 이미지 속 인물의 얼굴형, 눈코입의 특징, 헤어스타일, 체형, 의상 스타일을 정밀하게 분석하십시오.
  각 장면의 'imagePrompt'에는 이 인물의 신체적 특징을 구체적으로 명시하여 모든 장면에서 동일 인물로 보이게 만드십시오.
  
  [규칙]
  1. 레퍼런스 이미지의 인물 정체성(Identity)을 100% 유지하십시오.
  2. 'description'은 한국어로 작성하십시오.
  3. 'imagePrompt'와 'i2vPrompt'는 영어로 상세히 작성하십시오.
  4. 10개의 유튜브 SEO 최적화 제목을 포함하십시오.
  5. 장면의 분위기는 시네마틱하고 전문적인 뮤직비디오 스타일이어야 합니다.`;

  const parts: any[] = [];
  if (referenceImageBase64) {
    const mimeType = getMimeTypeFromDataUrl(referenceImageBase64);
    const data = referenceImageBase64.split(',')[1];
    parts.push({ inlineData: { mimeType, data } });
    parts.push({ text: `IMPORTANT: ANALYZE THE REFERENCE IMAGE CAREFULLY. The main subject must look exactly like this in all scenes. Topic: ${topic}` });
  } else {
    parts.push({ text: `Create a professional storyboard about: ${topic}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI 응답을 받지 못했습니다.");
    
    const cleanJson = extractJson(text);
    const parsed = JSON.parse(cleanJson);
    
    const processedScenes = parsed.scenes.map((scene: any) => ({
      ...scene,
      imagePrompt: `Cinematic billboard style, highly detailed portrait consistency, ${scene.imagePrompt}`,
      i2vPrompt: `${scene.i2vPrompt} There is no slow motion, and the scene unfolds quickly.`
    }));

    return { scenes: processedScenes, titles: parsed.titles || [] };
  } catch (error: any) {
    console.error("Story Gen Error:", error);
    throw new Error(`스토리 생성 실패: ${error.message}`);
  }
};

export const generateTitles = async (topic: string): Promise<TitleData[]> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-flash-preview";

  const titlesSchema: any = {
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
      contents: { parts: [{ text: `Generate 10 viral SEO titles for: ${topic}` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: titlesSchema,
      },
    });
    const cleanJson = extractJson(response.text || '{"titles":[]}');
    return JSON.parse(cleanJson).titles;
  } catch (error) {
    console.error("Title Generation Error:", error);
    throw error;
  }
};

export const generateSceneImage = async (
  modelType: ModelType, 
  prompt: string, 
  aspectRatio: AspectRatio, 
  referenceImageBase64?: string | null
): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const modelId = modelType === ModelType.NanoBananaPro ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";

  const parts: any[] = [];
  if (referenceImageBase64) {
    const mimeType = getMimeTypeFromDataUrl(referenceImageBase64);
    const data = referenceImageBase64.split(',')[1];
    parts.push({ inlineData: { mimeType, data } });
    parts.push({ text: `Based on this reference image, generate a new image that EXACTLY matches the identity, facial features, and appearance of the subject: ${prompt}` });
  } else {
    parts.push({ text: prompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: { 
        imageConfig: { 
          aspectRatio,
          imageSize: modelType === ModelType.NanoBananaPro ? "1K" : undefined
        } 
      }
    });

    const responseParts = response.candidates?.[0]?.content?.parts;
    if (responseParts) {
      for (const part of responseParts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("이미지 데이터가 응답에 포함되지 않았습니다.");
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    throw new Error(`이미지 생성 실패: ${error.message}`);
  }
};

export const generateVeoVideo = async (modelId: VeoModel, prompt: string, aspectRatio: VeoAspectRatio, resolution: VeoResolution, referenceImageBase64: string | null): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const config: any = { numberOfVideos: 1, resolution, aspectRatio };
    // Veo에서도 레퍼런스 인물 특징 강조를 위해 프롬프트 보강
    const enhancedPrompt = referenceImageBase64 
      ? `Main subject must look identical to the attached reference image. ${prompt}`
      : prompt;

    const params: any = { model: modelId, prompt: enhancedPrompt, config };

    if (referenceImageBase64) {
      params.image = { 
        imageBytes: referenceImageBase64.split(',')[1], 
        mimeType: getMimeTypeFromDataUrl(referenceImageBase64) 
      };
    }

    let operation = await ai.models.generateVideos(params);
    while (!operation.done) {
      await new Promise(r => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("비디오 생성 결과 링크가 없습니다.");
    
    const response = await fetch(`${videoUri}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Veo Video Error:", error);
    throw error;
  }
};
