import React from 'react';

interface ImagePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  // URL이 비디오인지 이미지인지 간단하게 판별 (VEO 비디오의 경우 blob 혹은 stream URL일 수 있음)
  const isVideo = url.includes('blob:') || url.includes('.mp4') || url.includes('video');

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-12 cursor-zoom-out animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl">
        {isVideo ? (
          <video 
            src={url} 
            controls 
            autoPlay 
            loop 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img 
            src={url} 
            alt="Full Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10"
          />
        )}
        
        {/* Close button */}
        <button 
          className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Hint text */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium uppercase tracking-widest whitespace-nowrap">
          Click anywhere to close preview
        </div>
      </div>
    </div>
  );
};