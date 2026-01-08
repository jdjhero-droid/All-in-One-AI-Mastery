
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export enum ModelType {
  NanoBanana = 'NanoBanana', // gemini-2.5-flash-image
  NanoBananaPro = 'NanoBananaPro' // gemini-3-pro-image-preview
}

// Veo Specific Types
export type VeoModel = 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview';
export type VeoAspectRatio = '16:9' | '9:16';
export type VeoResolution = '720p' | '1080p';

export interface TitleData {
  english: string;
  korean: string;
}

export interface SceneData {
  sceneNumber: number;
  description: string; // Korean narrative
  imagePrompt: string; // English prompt for generation
  i2vPrompt: string; // English I2V technical prompt
}

export interface GeneratedScene extends SceneData {
  imageUrl?: string;
  isLoading: boolean;
  error?: string;
}

export interface StoryGenerationResult {
  scenes: SceneData[];
  titles: TitleData[];
}

export interface HistoryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  label: string;
  timestamp: number;
  aspectRatio?: string;
}

export interface AppState {
  apiKey: string;
  topic: string;
  referenceImage: string | null; // Base64
  selectedModel: ModelType;
  isGeneratingStory: boolean;
  scenes: GeneratedScene[];
  titles: TitleData[];
  isApiKeyModalOpen: boolean;
  // Veo State
  veoModel: VeoModel;
  veoAspectRatio: VeoAspectRatio;
  veoResolution: VeoResolution;
  generatedVideoUrl: string | null;
  isGeneratingVideo: boolean;
  veoError: string | null;
  // History
  history: HistoryItem[];
}

// Add global declaration for AI Studio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}