export default function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="flg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#flg)" />
                <path d="M8 22L13 10L16 18L19 12L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="logo-text">BG Remover</span>
            </div>
            <p className="brand-tagline">Remove image backgrounds instantly with AI.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <button onClick={() => scrollTo('features')}>Features</button>
              <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
              <button onClick={() => scrollTo('faq')}>FAQ</button>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <button>Privacy Policy</button>
              <button>Terms of Service</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">© {new Date().getFullYear()} BG Remover. All rights reserved.</p>
          <p className="powered-by">
            Powered by <a href="https://www.remove.bg" target="_blank" rel="noopener noreferrer">Remove.bg</a>
            & <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer">Cloudflare</a>
          </p>
        </div>
      </div>
      <style>{`
        .footer { padding: 4rem 0 2rem; border-top: 1px solid var(--color-glass-border); }
        .footer-content { display: flex; justify-content: space-between; gap: 3rem; margin-bottom: 3rem; flex-wrap: wrap; }
        .footer-brand { max-width: 280px; }
        .footer-brand .logo { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
        .footer-brand .logo-text { font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .brand-tagline { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; }
        .footer-links { display: flex; gap: 4rem; flex-wrap: wrap; }
        .link-group { display: flex; flex-direction: column; gap: 0.75rem; }
        .link-group h4 { font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem; }
        .link-group button, .link-group a { font-size: 0.9rem; color: var(--color-text-secondary); background: none; text-align: left; transition: color var(--transition-fast); }
        .link-group button:hover, .link-group a:hover { color: var(--color-text-primary); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid var(--color-glass-border); flex-wrap: wrap; gap: 1rem; }
        .copyright { font-size: 0.85rem; color: var(--color-text-muted); }
        .powered-by { font-size: 0.85rem; color: var(--color-text-muted); }
        .powered-by a { color: var(--color-accent-purple); }
        @media (max-width: 600px) { .footer-content { flex-direction: column; } .footer-bottom { flex-direction: column; text-align: center; } }
      `}</style>
    </footer>
  );
}
