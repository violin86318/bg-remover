import { useState, useRef } from 'react';

export default function ImageProcessor({ originalPreview, processedImage, status, error, onReset }) {
  const [viewMode, setViewMode] = useState('result'); // result | original

  const downloadResult = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'bg_removed.png';
    link.click();
  };

  return (
    <section id="processor" className="processor-section">
      <div className="container">
        <div className="processor-card glass-card">
          <div className="processor-label">
            <span className="label-dot" />
            Result
          </div>

          {/* Processing */}
          {status === 'processing' && (
            <div className="processing-state">
              <div className="spinner" />
              <h3>AI is removing the background...</h3>
              <p>This usually takes 3–5 seconds</p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="error-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>Something went wrong</h3>
              <p>{error || 'Please try again with a different image.'}</p>
              <button onClick={onReset} className="btn btn-secondary">Try Another Image</button>
            </div>
          )}

          {/* Done */}
          {(status === 'done' && processedImage) && (
            <div className="result-state">
              {/* View toggle */}
              <div className="result-view-toggle">
                <button
                  className={`view-btn ${viewMode === 'result' ? 'active' : ''}`}
                  onClick={() => setViewMode('result')}
                >
                  Result
                </button>
                <button
                  className={`view-btn ${viewMode === 'original' ? 'active' : ''}`}
                  onClick={() => setViewMode('original')}
                >
                  Original
                </button>
              </div>

              {/* Image display */}
              <div className={`result-image-area ${viewMode === 'result' ? 'checkerboard' : ''}`}>
                <img
                  src={viewMode === 'result' ? processedImage : originalPreview}
                  alt={viewMode === 'result' ? 'Background Removed' : 'Original'}
                  draggable={false}
                />
                <span className="result-image-label">
                  {viewMode === 'result' ? 'Transparent Result' : 'Original'}
                </span>
              </div>

              <div className="result-actions">
                <button onClick={downloadResult} className="btn btn-primary btn-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PNG
                </button>
                <button onClick={onReset} className="btn btn-secondary btn-lg">Try Another Image</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .processor-section { padding: var(--section-padding) 0; }
        .processor-card { padding: 2rem; }
        .processor-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }
        .label-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-success);
          box-shadow: 0 0 10px var(--color-success);
          animation: pulse 2s ease-in-out infinite;
        }
        .processing-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        .spinner {
          width: 56px;
          height: 56px;
          border: 3px solid rgba(124, 58, 237, 0.2);
          border-top-color: var(--color-accent-purple);
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 0.8s linear infinite;
        }
        .processing-state h3 { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .processing-state p { color: var(--color-text-muted); }
        .error-state { text-align: center; padding: 4rem 2rem; }
        .error-state svg { color: var(--color-error); margin-bottom: 1rem; }
        .error-state h3 { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .error-state p { color: var(--color-text-muted); margin-bottom: 1.5rem; }
        .result-state { animation: fadeIn 0.5s ease forwards; }
        .comparison-container {
          position: relative;
          width: 100%;
          max-width: 700px;
          aspect-ratio: 16 / 10;
          margin: 0 auto 2rem;
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: col-resize;
          user-select: none;
        }
        .comparison-image {
          position: absolute;
          inset: 0;
        }
        .comparison-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
        }
        .comparison-original { z-index: 1; }
        .comparison-processed { z-index: 2; }
        .slider-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translateX(-50%);
          cursor: col-resize;
        }
        .slider-line {
          width: 2px;
          flex: 1;
          background: white;
          box-shadow: 0 0 8px rgba(0,0,0,0.5);
        }
        .slider-knob {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          color: var(--color-accent-purple);
        }
        .slider-knob svg:first-child { margin-right: -3px; }
        .slider-knob svg:last-child { margin-left: -3px; }
        .comparison-label {
          position: absolute;
          bottom: 1rem;
          padding: 0.35rem 0.85rem;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          z-index: 5;
          pointer-events: none;
        }
        .label-original { left: 1rem; }
        .label-result { right: 1rem; }
        .result-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-lg { padding: 0.9rem 2rem; font-size: 1rem; }
        /* New: view toggle */
        .result-view-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
        }
        .view-btn {
          padding: 8px 20px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }
        .view-btn:hover { border-color: var(--color-border-hover); color: var(--color-text-primary); }
        .view-btn.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
        }
        /* New: image display */
        .result-image-area {
          position: relative;
          width: 100%;
          max-width: 700px;
          aspect-ratio: 16 / 10;
          margin: 0 auto 2rem;
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a2e;
        }
        .result-image-area img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          pointer-events: none;
        }
        .result-image-label {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 14px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
