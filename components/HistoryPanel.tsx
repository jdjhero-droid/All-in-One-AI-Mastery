import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onDelete, onClear }) => {
  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="w-72 h-full bg-dark-900 border-l border-gray-800 flex flex-col z-20 shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/20">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-banana-500">📜</span> Generation History
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-[10px] text-gray-500 hover:text-red-400 font-bold transition-colors uppercase tracking-widest"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-4">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-medium">History is empty</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="group relative bg-dark-800 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all shadow-lg">
              <div className="aspect-video relative bg-black">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button 
                     onClick={() => downloadAsset(item.url, `${item.type}_${item.id}.png`)}
                     className="p-2 bg-banana-500 rounded-full text-dark-900 shadow-xl transform scale-75 group-hover:scale-100 transition-transform"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   </button>
                   <button 
                     onClick={() => window.open(item.url, '_blank')}
                     className="p-2 bg-white rounded-full text-dark-900 shadow-xl transform scale-75 group-hover:scale-100 transition-transform delay-75"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   </button>
                </div>

                <div className="absolute top-1 left-1 flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter ${item.type === 'image' ? 'bg-banana-500 text-dark-900' : 'bg-indigo-600 text-white'}`}>
                    {item.type}
                  </span>
                </div>

                <button 
                  onClick={() => onDelete(item.id)}
                  className="absolute top-1 right-1 p-1 bg-black/40 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white rounded transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-2 bg-dark-800">
                <p className="text-[10px] text-gray-300 line-clamp-1 font-medium mb-1">{item.label}</p>
                <p className="text-[9px] text-gray-500 font-mono">{formatTime(item.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-3 border-t border-gray-800 text-center">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Saved Locally</p>
      </div>
    </div>
  );
};