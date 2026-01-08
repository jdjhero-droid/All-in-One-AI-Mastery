
import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey, removeApiKey, hasApiKey } from '../utils/keyStorage';
import { testConnection } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyStatusChange: (isSet: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyStatusChange }) => {
  const [keyInput, setKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getApiKey();
      setKeyInput(stored || '');
      setIsSaved(hasApiKey());
      setTestResult('idle');
    }
  }, [isOpen]);

  const handleTest = async () => {
    if (!keyInput.trim()) return;
    setIsTesting(true);
    setTestResult('idle');
    const success = await testConnection(keyInput);
    setIsTesting(false);
    setTestResult(success ? 'success' : 'fail');
  };

  const handleSave = () => {
    if (!keyInput.trim()) return;
    saveApiKey(keyInput);
    setIsSaved(true);
    onKeyStatusChange(true);
    onClose();
  };

  const handleDelete = () => {
    removeApiKey();
    setKeyInput('');
    setIsSaved(false);
    onKeyStatusChange(false);
    setTestResult('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-dark-800 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-banana-500">⚙️</span> API Settings
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Google Gemini API Key</label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setTestResult('idle');
                }}
                className="w-full bg-black/50 border border-gray-600 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-banana-500 font-mono tracking-widest transition-all"
                placeholder="AIzaSy..."
              />
              {isSaved && (
                <div className="absolute right-3 top-3 text-green-500" title="Key Saved Locally">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-500">
              Keys are encrypted and stored in your browser's local storage.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={isTesting || !keyInput}
              className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${
                testResult === 'success' ? 'border-green-500 bg-green-500/10 text-green-500' :
                testResult === 'fail' ? 'border-red-500 bg-red-500/10 text-red-500' :
                'border-gray-600 hover:border-white text-gray-300'
              }`}
            >
              {isTesting ? 'Testing...' : testResult === 'success' ? 'Connection OK' : testResult === 'fail' ? 'Test Failed' : 'Test Connection'}
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-900/50 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors"
          >
            Clear Data
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-banana-500 text-dark-900 hover:bg-banana-400 shadow-lg shadow-banana-500/20 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
