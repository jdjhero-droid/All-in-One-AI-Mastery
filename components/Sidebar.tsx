import React, { useRef } from 'react';
import { ModelType, AspectRatio, VeoModel, VeoAspectRatio, VeoResolution } from '../types';

interface SidebarProps {
  // Storyboard Props
  selectedModel: ModelType;
  onModelSelect: (model: ModelType) => void;
  selectedAspectRatio: AspectRatio;
  onAspectRatioSelect: (ratio: AspectRatio) => void;
  topic: string;
  onTopicChange: (topic: string) => void;
  referenceImage: string | null;
  onImageUpload: (base64: string) => void;
  sceneCount: number;
  onSceneCountChange: (count: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  
  // Veo Props
  veoModel: VeoModel;
  onVeoModelSelect: (model: VeoModel) => void;
  veoAspectRatio: VeoAspectRatio;
  onVeoAspectRatioSelect: (ratio: VeoAspectRatio) => void;
  veoResolution: VeoResolution;
  onVeoResolutionSelect: (res: VeoResolution) => void;
  onVeoGenerate: () => void;
  isGeneratingVideo: boolean;

  // General Props
  onOpenApiSettings: () => void;
  apiKeySet: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedModel,
  onModelSelect,
  selectedAspectRatio,
  onAspectRatioSelect,
  topic,
  onTopicChange,
  referenceImage,
  onImageUpload,
  sceneCount,
  onSceneCountChange,
  onGenerate,
  isGenerating,
  
  veoModel,
  onVeoModelSelect,
  veoAspectRatio,
  onVeoAspectRatioSelect,
  veoResolution,
  onVeoResolutionSelect,
  onVeoGenerate,
  isGeneratingVideo,

  onOpenApiSettings,
  apiKeySet
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const ratios: { label: AspectRatio; width: number; height: number }[] = [
    { label: '1:1', width: 24, height: 24 },
    { label: '4:3', width: 32, height: 24 },
    { label: '16:9', width: 36, height: 20 },
    { label: '3:4', width: 18, height: 24 },
    { label: '9:16', width: 14, height: 24 },
  ];

  return (
    <div className="w-full md:w-80 h-full bg-dark-900 border-r border-gray-800 flex flex-col overflow-y-auto z-20 shadow-xl scrollbar-hide">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🦁</span>
          Wild Teacher
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">All-in-One AI Mastery</p>
      </div>

      {/* --- Common Input Section --- */}
      <div className="px-6 mb-6">
         
         {/* Image Upload - Top & 4:3 Ratio */}
         <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Reference Image (Optional)</label>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-banana-500 hover:text-banana-500 transition-colors bg-gray-800/50 overflow-hidden relative"
          >
            {referenceImage ? (
              <>
                 <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white">Change Image</span>
                 </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs">Upload Reference (4:3)</span>
              </div>
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          {referenceImage && (
             <button 
                onClick={(e) => { e.stopPropagation(); onImageUpload(''); }}
                className="text-xs text-red-400 hover:text-red-300 mt-1 w-full text-right"
             >
               Remove
             </button>
          )}
        </div>

         {/* Topic Input */}
         <div>
          <label className="text-xs text-gray-500 mb-1 block">Topic / Prompt</label>
          <textarea
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="E.g., A cyberpunk detective..."
            className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-banana-500 resize-none placeholder-gray-600 transition-colors"
          />
        </div>
      </div>

      <hr className="border-gray-800 mb-6" />

      {/* --- STORYBOARD MODE --- */}
      <div className="px-6 pb-6">
        <h2 className="text-xs font-bold text-banana-500 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <span className="w-2 h-2 rounded-full bg-banana-500"></span>
          Storyboard Generator
        </h2>

        {/* Model Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
           <button 
             onClick={() => onModelSelect(ModelType.NanoBanana)}
             className={`p-2 rounded border text-xs text-left ${selectedModel === ModelType.NanoBanana ? 'border-banana-500 bg-banana-500/10 text-white' : 'border-gray-700 text-gray-500'}`}
           >
             NanoBanana
           </button>
           <button 
             onClick={() => onModelSelect(ModelType.NanoBananaPro)}
             className={`p-2 rounded border text-xs text-left ${selectedModel === ModelType.NanoBananaPro ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-gray-700 text-gray-500'}`}
           >
             Pro
           </button>
        </div>

        {/* Scene Count Input */}
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Number of Cuts</label>
                <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-700">{sceneCount} Scenes</span>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={sceneCount}
                    onChange={(e) => onSceneCountChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-banana-500"
                />
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={sceneCount}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0 && val <= 20) onSceneCountChange(val);
                    }}
                    className="w-12 bg-dark-800 border border-gray-700 rounded-md py-1 text-center text-xs text-white focus:border-banana-500 outline-none"
                />
            </div>
        </div>

        {/* Aspect Ratio */}
        <div className="grid grid-cols-5 gap-1 mb-4">
            {ratios.map((ratio) => (
                <button
                    key={ratio.label}
                    onClick={() => onAspectRatioSelect(ratio.label)}
                    className={`flex flex-col items-center justify-center p-1 rounded border transition-all h-10 ${
                        selectedAspectRatio === ratio.label
                        ? 'border-banana-500 bg-banana-500/10 text-banana-500'
                        : 'border-gray-700 bg-gray-800 text-gray-500'
                    }`}
                >
                    <span className="text-[9px] font-bold">{ratio.label}</span>
                </button>
            ))}
        </div>

        <button 
          onClick={onGenerate}
          disabled={!topic || isGenerating || isGeneratingVideo}
          className={`w-full py-3 rounded-lg font-bold text-dark-900 transition-all text-sm ${
            !topic || isGenerating || isGeneratingVideo
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-banana-500 hover:bg-banana-400'
          }`}
        >
          {isGenerating ? 'Processing...' : 'Generate Storyboard'}
        </button>
      </div>

      {/* --- VEO STUDIO MODE --- */}
      <div className="mt-auto bg-indigo-900/20 border-t border-indigo-900/50 p-6">
        <h2 className="text-xs font-bold text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Veo Studio
        </h2>

        {/* Veo Model */}
        <div className="mb-3">
          <label className="text-[10px] text-indigo-300 block mb-1">Model</label>
          <select 
            value={veoModel}
            onChange={(e) => onVeoModelSelect(e.target.value as VeoModel)}
            className="w-full bg-dark-800 border border-indigo-900/50 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
          >
            <option value="veo-3.1-fast-generate-preview">Veo 3.1 Fast (Preview)</option>
            <option value="veo-3.1-generate-preview">Veo 3.1 (High Quality)</option>
          </select>
        </div>

        <div className="flex gap-2 mb-4">
           {/* Ratio */}
           <div className="flex-1">
             <label className="text-[10px] text-indigo-300 block mb-1">Ratio</label>
             <select 
               value={veoAspectRatio}
               onChange={(e) => onVeoAspectRatioSelect(e.target.value as VeoAspectRatio)}
               className="w-full bg-dark-800 border border-indigo-900/50 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
             >
               <option value="16:9">16:9</option>
               <option value="9:16">9:16</option>
             </select>
           </div>
           
           {/* Resolution */}
           <div className="flex-1">
             <label className="text-[10px] text-indigo-300 block mb-1">Quality</label>
             <select 
               value={veoResolution}
               onChange={(e) => onVeoResolutionSelect(e.target.value as VeoResolution)}
               className="w-full bg-dark-800 border border-indigo-900/50 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
             >
               <option value="720p">720p</option>
               <option value="1080p">1080p</option>
             </select>
           </div>
        </div>

        <button 
          onClick={onVeoGenerate}
          disabled={!topic || isGenerating || isGeneratingVideo}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all text-sm shadow-lg ${
            !topic || isGenerating || isGeneratingVideo
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {isGeneratingVideo ? (
             <span className="flex items-center justify-center gap-2">
               <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               Generating Video...
             </span>
          ) : 'Generate Video'}
        </button>
      </div>

      {/* Footer Settings & Developer Info */}
      <div className="p-4 border-t border-gray-800 bg-dark-900">
        <button 
          onClick={onOpenApiSettings}
          className="flex items-center text-gray-500 hover:text-white transition-colors text-xs w-full mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings {apiKeySet && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>}
        </button>

        <div className="flex flex-col items-start border-t border-gray-800 pt-3">
            <span className="text-[10px] text-gray-500 font-bold mb-2">Developer. Wild Teacher</span>
            <a 
                href="https://open.kakao.com/o/guhUuT5h" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FAE100] text-[#371D1E] rounded-md text-xs font-bold hover:bg-[#ffe600] transition-colors w-full justify-center"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.27 6.054-.188.702-.682 2.545-.78 2.94-.122.49.178.483.376.351.27-.18 4.295-2.914 4.89-3.31.233.013.468.03.706.03 4.97 0 9-3.185 9-7.115S17.636 3 12 3z"/>
                </svg>
                KakaoTalk
            </a>
        </div>
      </div>
    </div>
  );
};