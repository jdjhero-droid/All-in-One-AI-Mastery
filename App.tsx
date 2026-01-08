import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ResultGrid } from './components/ResultGrid';
import { HistoryPanel } from './components/HistoryPanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ModelType, GeneratedScene, AspectRatio, TitleData, VeoModel, VeoAspectRatio, VeoResolution, HistoryItem } from './types';
import { generateStoryStructure, generateSceneImage, generateVeoVideo, generateTitles } from './services/geminiService';
import { hasApiKey } from './utils/keyStorage';

const HISTORY_STORAGE_KEY = 'wt_generation_history_v1';

const App: React.FC = () => {
  // Common State
  const [topic, setTopic] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Storyboard State
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.NanoBanana);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('16:9');
  const [sceneCount, setSceneCount] = useState<number>(10);
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [titles, setTitles] = useState<TitleData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isRegeneratingTitles, setIsRegeneratingTitles] = useState(false);

  // Veo State
  const [veoModel, setVeoModel] = useState<VeoModel>('veo-3.1-fast-generate-preview');
  const [veoAspectRatio, setVeoAspectRatio] = useState<VeoAspectRatio>('16:9');
  const [veoResolution, setVeoResolution] = useState<VeoResolution>('720p');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [veoError, setVeoError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // UI State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);

  useEffect(() => {
    setApiKeySet(hasApiKey());
    // Load history
    const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const ensureApiKey = (): boolean => {
    if (!hasApiKey()) {
      setIsApiKeyModalOpen(true);
      return false;
    }
    return true;
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
  };

  const handleGenerateStoryboard = async () => {
    if (!ensureApiKey()) return;
    if (!topic) return;

    setIsGenerating(true);
    setIsGeneratingStory(true);
    setScenes([]);
    setTitles([]);

    try {
      const result = await generateStoryStructure(topic, referenceImage, sceneCount);
      const initializedScenes: GeneratedScene[] = result.scenes.map(s => ({ ...s, isLoading: true }));

      setScenes(initializedScenes);
      setTitles(result.titles);
      setIsGeneratingStory(false);

      const scenePromises = initializedScenes.map(async (scene, index) => {
        try {
          const imageUrl = await generateSceneImage(selectedModel, scene.imagePrompt, selectedAspectRatio);
          setScenes(prev => {
            const newScenes = [...prev];
            if (newScenes[index]) newScenes[index] = { ...newScenes[index], imageUrl, isLoading: false };
            return newScenes;
          });
          
          // Add to History
          addToHistory({
            type: 'image',
            url: imageUrl,
            label: `Scene ${scene.sceneNumber}: ${topic.substring(0, 30)}...`,
            aspectRatio: selectedAspectRatio
          });

        } catch (error) {
           console.error(`Scene ${scene.sceneNumber} failed:`, error);
           setScenes(prev => {
            const newScenes = [...prev];
            if (newScenes[index]) {
                newScenes[index] = { ...newScenes[index], isLoading: false, error: 'Failed' };
            }
            return newScenes;
          });
        }
      });
      await Promise.allSettled(scenePromises);
    } catch (error) {
      console.error("Workflow failed", error);
      setScenes([]);
    } finally {
      setIsGenerating(false);
      setIsGeneratingStory(false);
    }
  };

  const handleRegenerateTitles = async () => {
    if (!ensureApiKey()) return;
    if (!topic) return;
    setIsRegeneratingTitles(true);
    try {
        const newTitles = await generateTitles(topic);
        setTitles(newTitles);
    } catch (error) {
        console.error("Failed to regenerate titles", error);
    } finally {
        setIsRegeneratingTitles(false);
    }
  };

  const handleGenerateVeoVideo = async () => {
    if (!ensureApiKey()) return;
    if (!topic) return;

    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    setVeoError(null);

    try {
        const videoUrl = await generateVeoVideo(veoModel, topic, veoAspectRatio, veoResolution, referenceImage);
        setGeneratedVideoUrl(videoUrl);
        
        // Add to History
        addToHistory({
          type: 'video',
          url: videoUrl,
          label: `Veo Video: ${topic.substring(0, 30)}...`,
          aspectRatio: veoAspectRatio
        });

    } catch (error: any) {
        console.error("Veo failed", error);
        setVeoError(error.message || "Failed to generate video.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const handleRegenerateScene = async (index: number, newPrompt: string) => {
     if (!ensureApiKey()) return;
     setScenes(prev => {
         const newScenes = [...prev];
         if (newScenes[index]) {
             newScenes[index] = { ...newScenes[index], imagePrompt: newPrompt, isLoading: true, error: undefined, imageUrl: undefined };
         }
         return newScenes;
     });
     try {
         const imageUrl = await generateSceneImage(selectedModel, newPrompt, selectedAspectRatio);
         setScenes(prev => {
            const newScenes = [...prev];
            if (newScenes[index]) newScenes[index] = { ...newScenes[index], imageUrl, isLoading: false };
            return newScenes;
         });
         
         // Add to History
         addToHistory({
            type: 'image',
            url: imageUrl,
            label: `Regen Scene ${index + 1}: ${topic.substring(0, 20)}...`,
            aspectRatio: selectedAspectRatio
          });

     } catch (error) {
         setScenes(prev => {
            const newScenes = [...prev];
            if (newScenes[index]) newScenes[index] = { ...newScenes[index], isLoading: false, error: 'Failed' };
            return newScenes;
         });
     }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-dark-900 text-white overflow-hidden font-sans">
      <Sidebar 
        selectedModel={selectedModel}
        onModelSelect={setSelectedModel}
        selectedAspectRatio={selectedAspectRatio}
        onAspectRatioSelect={setSelectedAspectRatio}
        sceneCount={sceneCount}
        onSceneCountChange={setSceneCount}
        topic={topic}
        onTopicChange={setTopic}
        referenceImage={referenceImage}
        onImageUpload={setReferenceImage}
        onGenerate={handleGenerateStoryboard}
        isGenerating={isGenerating}
        veoModel={veoModel}
        onVeoModelSelect={setVeoModel}
        veoAspectRatio={veoAspectRatio}
        onVeoAspectRatioSelect={setVeoAspectRatio}
        veoResolution={veoResolution}
        onVeoResolutionSelect={setVeoResolution}
        onVeoGenerate={handleGenerateVeoVideo}
        isGeneratingVideo={isGeneratingVideo}
        onOpenApiSettings={() => setIsApiKeyModalOpen(true)}
        apiKeySet={apiKeySet} 
      />
      
      <ResultGrid 
        scenes={scenes}
        titles={titles}
        isGeneratingStory={isGeneratingStory}
        onRegenerate={handleRegenerateScene}
        videoUrl={generatedVideoUrl}
        isGeneratingVideo={isGeneratingVideo}
        veoError={veoError}
        onRetryVeo={handleGenerateVeoVideo}
        onRegenerateTitles={handleRegenerateTitles}
        isRegeneratingTitles={isRegeneratingTitles}
      />

      <HistoryPanel 
        history={history}
        onDelete={handleDeleteHistoryItem}
        onClear={handleClearHistory}
      />
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyStatusChange={setApiKeySet}
      />
    </div>
  );
};

export default App;