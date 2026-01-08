import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Could not find root element to mount to");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the app:", error);
    rootElement.innerHTML = `
      <div class="error-fallback">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Application Error</h1>
        <p>애플리케이션 로드 중 오류가 발생했습니다.</p>
        <pre style="background: #000; padding: 1rem; border-radius: 8px; margin-top: 1rem; max-width: 80%; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="location.reload()" style="margin-top: 2rem; padding: 0.5rem 1rem; background: #FFD700; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">다시 시도</button>
      </div>
    `;
  }
}