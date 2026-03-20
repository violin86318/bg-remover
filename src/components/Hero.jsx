import { useRef, useState } from 'react';

export default function Hero({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndEmit(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndEmit(file);
    e.target.value = '';
  };

  const validateAndEmit = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 12 * 1024 * 1024; // 12MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > maxSize) {
      alert('File size must be under 12MB.');
      return;
    }
    onFileSelect(file);
  };

  return (
    <section id="hero" className="hero">
      {/* Background glows */}
      <div className="hero-bg" />
      <div className="hero-glow" />

      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Remove Image Background{' '}
            <span className="text-gradient">Instantly</span>
          </h1>
          <p className="hero-subtitle">
            Powered by AI · 100% Free · No Signup Required
          </p>

          {/* Upload Zone */}
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="upload-border" viewBox="0 0 400 200" preserveAspectRatio="none">
              <rect
                x="2" y="2" width="396" height="196" rx="18"
                fill="none"
                stroke="url(#borderGrad)"
                strokeWidth="2"
                strokeDasharray="10 6"
              />
              <defs>
                <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            <div className="upload-content">
              <div className="upload-icon-wrapper">
                <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="upload-title">
                {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
              </h3>
              <p className="upload-hint">or click to browse</p>

              <div className="upload-formats">
                <span>JPG</span>
                <span>PNG</span>
                <span>WebP</span>
                <span className="max-size">Max 12MB</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>

          {/* Trust badges */}
          <div className="trust-badges">
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Privacy Safe
            </span>
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Processed in 5s
            </span>
            <span className="badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              No Signup
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 80px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: var(--gradient-hero);
        }
        .hero-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: var(--gradient-glow);
          filter: blur(80px);
          opacity: 0.5;
          pointer-events: none;
        }
        .hero-content {
          position: relative;
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
          animation: fadeIn 0.8s ease forwards;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          margin-bottom: 1rem;
          line-height: 1.1;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
        }
        .upload-zone {
          position: relative;
          padding: 3px;
          border-radius: 20px;
          cursor: pointer;
          transition: transform var(--transition-base);
        }
        .upload-zone:hover {
          transform: scale(1.01);
        }
        .upload-zone.dragging {
          transform: scale(1.02);
        }
        .upload-border {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .upload-content {
          background: var(--color-glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--color-glass-border);
          border-radius: 18px;
          padding: 3rem 2rem;
          transition: all var(--transition-base);
        }
        .upload-zone:hover .upload-content {
          border-color: var(--color-border-hover);
          background: rgba(124, 58, 237, 0.08);
        }
        .upload-icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 3s ease-in-out infinite;
        }
        .upload-icon {
          color: var(--color-accent-purple);
        }
        .upload-title {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }
        .upload-hint {
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }
        .upload-formats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .upload-formats span {
          padding: 0.25rem 0.75rem;
          background: rgba(124, 58, 237, 0.15);
          border: 1px solid var(--color-border);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }
        .max-size {
          color: var(--color-accent-cyan) !important;
          border-color: rgba(6, 182, 212, 0.3) !important;
          background: rgba(6, 182, 212, 0.1) !important;
        }
        .trust-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }
        .badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .badge svg {
          color: var(--color-accent-purple);
        }
      `}</style>
    </section>
  );
}
