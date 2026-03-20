import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-inner">
          {/* Logo */}
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <path d="M8 22L13 10L16 18L19 12L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="logo-text">BG Remover</span>
          </div>

          {/* Nav */}
          <nav className="header-nav">
            <button onClick={() => scrollTo('features')} className="nav-link">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="nav-link">How It Works</button>
            <button onClick={() => scrollTo('faq')} className="nav-link">FAQ</button>
          </nav>

          {/* Right side: theme toggle + CTA */}
          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn-primary btn-sm"
            >
              Try Free
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 0;
          background: rgba(10, 10, 26, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        .header.scrolled {
          padding: 0.7rem 0;
          background: rgba(10, 10, 26, 0.9);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-text {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .header-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .nav-link {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          background: none;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--color-text-primary);
          background: rgba(124, 58, 237, 0.1);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .theme-toggle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .theme-toggle:hover {
          color: var(--color-accent-purple);
          border-color: var(--color-border-hover);
        }
        .btn-sm {
          padding: 0.5rem 1.25rem;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
