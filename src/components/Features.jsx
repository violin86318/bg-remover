const features = [
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    title: 'Lightning Fast',
    description: 'AI-powered processing removes backgrounds in just 3–5 seconds. No waiting, no queues.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    title: '100% Privacy Safe',
    description: 'Your images are processed and returned instantly. We never store, share, or log your photos.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    title: 'Precise Edge Detection',
    description: 'State-of-the-art AI handles complex edges, hair, fur, and translucent areas with remarkable accuracy.',
  },
  {
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    title: 'Free to Use',
    description: 'No signup, no credit card, no limits. Remove backgrounds for free, right in your browser.',
  },
];

export default function Features() {
  return (
    <section id="features" className="features-section section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose <span className="text-gradient">BG Remover</span></h2>
          <p className="section-subtitle">Everything you need to remove backgrounds from images — fast, free, and beautifully simple.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card glass-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .section-header { text-align: center; max-width: 600px; margin: 0 auto 4rem; }
        .section-title { font-size: clamp(2rem, 4vw, 2.8rem); margin-bottom: 1rem; }
        .section-subtitle { font-size: 1.1rem; color: var(--color-text-secondary); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .feature-card { padding: 2rem; transition: all var(--transition-base); }
        .feature-card:hover { transform: translateY(-4px); border-color: var(--color-border-hover); box-shadow: var(--shadow-glow); }
        .feature-icon {
          width: 60px; height: 60px; border-radius: var(--radius-md);
          background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.15));
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem; color: var(--color-accent-purple);
        }
        .feature-title { font-size: 1.15rem; margin-bottom: 0.75rem; }
        .feature-description { font-size: 0.9rem; color: var(--color-text-secondary); line-height: 1.7; }
      `}</style>
    </section>
  );
}
