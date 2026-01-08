import React, { useState } from 'react';
import { GeneratedScene, TitleData } from '../types';

interface ResultGridProps {
  scenes: GeneratedScene[];
  titles?: TitleData[];
  isGeneratingStory: boolean;
  onRegenerate: (index: number, newPrompt: string) => void;
  // Veo Props
  videoUrl: string | null;
  isGeneratingVideo: boolean;
  veoError?: string | null;
  onRetryVeo?: () => void;
  // Title Regeneration Props
  onRegenerateTitles?: () => void;
  isRegeneratingTitles?: boolean;
}

export const ResultGrid: React.FC<ResultGridProps> = ({ 
  scenes, 
  titles = [], 
  isGeneratingStory, 
  onRegenerate,
  videoUrl,
  isGeneratingVideo,
  veoError,
  onRetryVeo,
  onRegenerateTitles,
  isRegeneratingTitles
}) => {
  const [editingScene, setEditingScene] = useState<{ index: number; prompt: string } | null>(null);

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    const validScenes = scenes.filter(s => s.imageUrl);
    if (validScenes.length === 0) return;

    validScenes.forEach((scene, index) => {
      setTimeout(() => {
        if (scene.imageUrl) {
          downloadImage(scene.imageUrl, `Scene_${String(scene.sceneNumber).padStart(2, '0')}.png`);
        }
      }, index * 500); 
    });
  };

  const handleRegenerateClick = () => {
    if (editingScene) {
      onRegenerate(editingScene.index, editingScene.prompt);
      setEditingScene(null);
    }
  };

  const hasImages = scenes.some(s => s.imageUrl);
  const showVideoSection = videoUrl || isGeneratingVideo || veoError;
  const showStorySection = scenes.length > 0 || isGeneratingStory;

  if (!showStorySection && !showVideoSection) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-10">
        <div className="w-20 h-20 mb-6 opacity-20">
            <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">No Content Generated Yet</h2>
        <p className="text-center max-w-md">Use the sidebar to generate a Storyboard or a Video.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto relative scrollbar-hide">
      <div className="max-w-7xl mx-auto pb-20 space-y-12">
        
        {/* VEO VIDEO SECTION */}
        {showVideoSection && (
            <div className={`bg-dark-800 rounded-2xl border overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-10 duration-500 ${veoError ? 'border-red-900/50' : 'border-indigo-900/30'}`}>
                <div className={`p-4 border-b flex items-center justify-between ${veoError ? 'bg-red-900/10 border-red-900/30' : 'bg-indigo-900/10 border-indigo-900/30'}`}>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className={veoError ? "text-red-400" : "text-indigo-400"}>🎬</span> Veo Generated Video
                    </h2>
                </div>
                
                <div className="aspect-video bg-black relative flex items-center justify-center">
                    {isGeneratingVideo ? (
                        <div className="text-center space-y-4">
                             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                             <div>
                                <p className="text-indigo-400 font-bold animate-pulse">Generating Video...</p>
                                <p className="text-gray-500 text-xs mt-1">This may take 1-2 minutes.</p>
                             </div>
                        </div>
                    ) : veoError ? (
                        <div className="text-center space-y-4 max-w-md px-6">
                            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-red-400 font-bold text-lg mb-2">Generation Failed</h3>
                                <p className="text-gray-400 text-sm">{veoError}</p>
                            </div>
                            {onRetryVeo && (
                                <button 
                                    onClick={onRetryVeo}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-red-600/20"
                                >
                                    Retry Generation
                                </button>
                            )}
                        </div>
                    ) : videoUrl ? (
                        <video 
                            src={videoUrl} 
                            controls 
                            autoPlay 
                            loop 
                            muted
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    ) : null}
                </div>
            </div>
        )}

        {/* STORYBOARD SECTION */}
        {showStorySection && (
            <div className="space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white">Generated Storyboard</h2>
                        <span className="text-gray-500 text-sm">{scenes.length} Scenes</span>
                    </div>
                    
                    {hasImages && (
                        <button 
                            onClick={handleDownloadAll}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-banana-500 transition-all shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download All
                        </button>
                    )}
                </div>

                {isGeneratingStory ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-8 bg-dark-800 rounded-xl border border-gray-800 border-dashed">
                        <div className="flex space-x-2 animate-pulse">
                            <div className="w-4 h-4 bg-banana-500 rounded-full"></div>
                            <div className="w-4 h-4 bg-banana-500 rounded-full animation-delay-200"></div>
                            <div className="w-4 h-4 bg-banana-500 rounded-full animation-delay-400"></div>
                        </div>
                        <p className="text-banana-500 font-mono animate-pulse">Designing Narrative Arc...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {scenes.map((scene, index) => (
                            <div key={scene.sceneNumber} className="bg-dark-800 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all flex flex-col group">
                                <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                                    {scene.imageUrl ? (
                                        <>
                                            <img 
                                                src={scene.imageUrl} 
                                                alt={`Scene ${scene.sceneNumber}`} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingScene({ index, prompt: scene.imagePrompt });
                                                }}
                                                className="absolute bottom-3 left-3 p-2.5 bg-black/60 hover:bg-banana-500 text-white hover:text-dark-900 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 shadow-lg"
                                                title="Edit & Regenerate"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadImage(scene.imageUrl!, `Scene_${String(scene.sceneNumber).padStart(2, '0')}.png`);
                                                }}
                                                className="absolute bottom-3 right-3 p-2.5 bg-black/60 hover:bg-banana-500 text-white hover:text-dark-900 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 shadow-lg"
                                                title="Download Image"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                        </>
                                    ) : scene.isLoading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm z-20">
                                            <div className="w-8 h-8 border-2 border-banana-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                            <span className="text-xs text-banana-500 font-mono">Rendering Scene...</span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-600 text-sm">Pending Generation</div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-bold text-white backdrop-blur-md z-10">
                                        SCENE {String(scene.sceneNumber).padStart(2, '0')}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Story</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed min-h-[60px]">{scene.description}</p>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                                        <h3 className="text-banana-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            I2V Prompt
                                        </h3>
                                        <div className="bg-gray-900 p-2 rounded border border-gray-800">
                                            <code className="text-xs text-green-400 font-mono block break-words">{scene.i2vPrompt}</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SEO Titles Section */}
                {titles.length > 0 && (
                    <div className="border-t border-gray-800 pt-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-banana-500 text-3xl">🔥</span>
                                YouTube SEO Optimized Titles
                            </h2>
                            {onRegenerateTitles && (
                                <button
                                    onClick={onRegenerateTitles}
                                    disabled={isRegeneratingTitles}
                                    className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-banana-500 transition-all shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isRegeneratingTitles ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {isRegeneratingTitles ? 'Generating...' : 'Regenerate Titles'}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {titles.map((title, idx) => (
                                <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <span className="text-gray-500 font-mono font-bold text-lg leading-none mt-1">{String(idx + 1).padStart(2, '0')}</span>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-lg mb-1">{title.english}</h3>
                                            <p className="text-gray-400 text-sm">{title.korean}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(`${title.english}\n${title.korean}`)}
                                            className="text-gray-500 hover:text-white transition-colors"
                                            title="Copy Title"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Edit & Regenerate Modal */}
      {editingScene && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-dark-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-banana-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Regenerate Scene {editingScene.index + 1}
                      </h3>
                      
                      <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Adjust Prompt</label>
                          <div className="text-xs text-gray-500 mb-2 font-mono">Prefix: "A hyper-realistic, documentary-style image." will be maintained.</div>
                          <textarea 
                              value={editingScene.prompt}
                              onChange={(e) => setEditingScene({ ...editingScene, prompt: e.target.value })}
                              className="w-full h-32 bg-black/50 border border-gray-600 rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-banana-500 resize-none font-mono"
                              placeholder="Enter changes to the image description..."
                          />
                      </div>

                      <div className="flex gap-3 justify-end">
                          <button 
                              onClick={() => setEditingScene(null)}
                              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleRegenerateClick}
                              className="px-6 py-2 rounded-lg bg-banana-500 hover:bg-banana-400 text-dark-900 font-bold text-sm shadow-lg shadow-banana-500/20"
                          >
                              Regenerate Image
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};