import { useState } from 'react';

const faqs = [
  { q: 'What image formats are supported?', a: 'We support JPG, PNG, and WebP formats. The maximum file size is 12MB per image.' },
  { q: 'Is it free to remove backgrounds?', a: 'Yes! BG Remover is completely free to use. No signup, no credit card, no hidden fees.' },
  { q: 'How does the AI background removal work?', a: 'We use state-of-the-art AI models (via Remove.bg API) trained on millions of images to accurately detect and remove backgrounds — even handling complex areas like hair and fur.' },
  { q: 'Is my image data safe?', a: 'Absolutely. Your images are processed in memory and returned directly to you. We never store, log, or share your photos with anyone.' },
  { q: 'What is the maximum file size?', a: 'The maximum upload size is 12MB. For best results, we recommend images under 5MB for fastest processing.' },
  { q: 'Can I use the result commercially?', a: 'Yes! Images processed with BG Remover can be used for personal and commercial purposes without attribution.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="faq-section section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
          <p className="section-subtitle">Everything you need to know about BG Remover.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item glass-card ${openIndex === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggle(i)}>
                <span>{faq.q}</span>
                <svg className="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`faq-answer ${openIndex === i ? 'visible' : ''}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .section-header { text-align: center; max-width: 600px; margin: 0 auto 4rem; }
        .section-title { font-size: clamp(2rem, 4vw, 2.8rem); margin-bottom: 1rem; }
        .section-subtitle { font-size: 1.1rem; color: var(--color-text-secondary); }
        .faq-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
        .faq-item { padding: 0; overflow: hidden; transition: all var(--transition-base); }
        .faq-item.open { border-color: var(--color-border-hover); }
        .faq-question {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          padding: 1.25rem 1.5rem; background: none; color: var(--color-text-primary);
          font-size: 1rem; font-weight: 600; text-align: left;
        }
        .faq-question:hover { color: var(--color-accent-purple); }
        .faq-chevron { flex-shrink: 0; color: var(--color-text-muted); transition: transform var(--transition-base); }
        .faq-item.open .faq-chevron { transform: rotate(180deg); color: var(--color-accent-purple); }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height var(--transition-base); }
        .faq-answer.visible { max-height: 300px; }
        .faq-answer p { padding: 0 1.5rem 1.25rem; color: var(--color-text-secondary); font-size: 0.95rem; line-height: 1.7; }
      `}</style>
    </section>
  );
}
