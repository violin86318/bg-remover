const steps = [
  { number: '01', title: 'Upload Your Image', description: 'Drag and drop or click to select any JPG, PNG, or WebP image up to 12MB.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
  { number: '02', title: 'AI Removes Background', description: 'Our powerful AI analyzes your image and precisely removes the background in seconds.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 1 0 10 10"/></svg> },
  { number: '03', title: 'Download Result', description: 'Get your transparent PNG instantly. Use it anywhere — no attribution required.',
    icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-section section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How It <span className="text-gradient">Works</span></h2>
          <p className="section-subtitle">Three simple steps to a perfectly cut-out image. No skills required.</p>
        </div>
        <div className="steps-wrapper">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              {index < steps.length - 1 && <div className="step-connector" />}
              <div className="step-card glass-card">
                <div className="step-number-badge">{step.number}</div>
                <div className="step-icon-wrapper">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .section-header { text-align: center; max-width: 600px; margin: 0 auto 4rem; }
        .section-title { font-size: clamp(2rem, 4vw, 2.8rem); margin-bottom: 1rem; }
        .section-subtitle { font-size: 1.1rem; color: var(--color-text-secondary); }
        .steps-wrapper { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; }
        .step-item { position: relative; }
        .step-connector { position: absolute; top: 60px; right: -1rem; width: 2rem; height: 2px; background: var(--gradient-primary); z-index: 2; }
        @media (max-width: 768px) { .step-connector { display: none; } }
        .step-card { padding: 2rem; text-align: center; height: 100%; position: relative; overflow: visible; }
        .step-number-badge {
          position: absolute; top: -1rem; left: 50%; transform: translateX(-50%);
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--gradient-primary);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-heading); font-weight: 700; font-size: 0.9rem; color: white;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
        }
        .step-icon-wrapper {
          width: 72px; height: 72px; margin: 1rem auto 1.5rem; border-radius: var(--radius-lg);
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.12));
          display: flex; align-items: center; justify-content: center; color: var(--color-accent-blue);
        }
        .step-title { font-size: 1.2rem; margin-bottom: 0.75rem; }
        .step-description { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.7; }
      `}</style>
    </section>
  );
}
