import { useState, useEffect, useRef } from 'react';
import { initGoogleAuth, signOutGoogle } from '../utils/googleAuth';

export default function Header({ user, onLogin, onLogout, onShowHistory }) {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Google Auth when component mounts
  useEffect(() => {
    initGoogleAuth(onLogin, (err) => {
      console.error('Google Auth init error:', err);
    });

    // Wait for Google SDK to load, then mark ready
    const check = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGsiReady(true);
        clearInterval(check);
      }
    }, 100);
    return () => clearInterval(check);
  }, [onLogin]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignInClick = () => {
    if (!gsiReady || !window.google?.accounts?.id) return;
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkipped()) {
        console.warn('Google sign-in not displayed:', notification.getNotDisplayedReason());
      }
    });
  };

  const handleSignOut = () => {
    signOutGoogle();
    onLogout();
    setShowUserMenu(false);
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
            <button onClick={() => { window.location.hash = 'pricing'; }} className="nav-link">Pricing</button>
          </nav>

          {/* Right side: auth + theme toggle + CTA */}
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

            {/* Auth Section */}
            {user ? (
              /* Logged in: show avatar + dropdown */
              <div className="user-menu-container" ref={menuRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`chevron ${showUserMenu ? 'open' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                      {(user.credits !== undefined || user.credits !== null) && (
                        <span className="user-credits">
                          {user.is_subscription_active ? '⭐ Pro Subscriber' : `🎫 ${user.credits ?? 0} Credits`}
                        </span>
                      )}
                    </div>
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item" onClick={onShowHistory}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      History
                    </button>
                    <button className="user-dropdown-item" onClick={handleSignOut}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in: show Google sign-in button */
              <div className="auth-buttons">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleSignInClick}
                  disabled={!gsiReady}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in
                </button>
                <button
                  onClick={() => { window.location.hash = ''; }}
                  className="btn btn-primary btn-sm"
                >
                  Try Free
                </button>
              </div>
            )}
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
        .btn-outline {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }
        .btn-outline:hover {
          background: var(--color-glass-bg);
          border-color: var(--color-border-hover);
        }
        .btn-outline svg {
          margin-right: 0.5rem;
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* User Menu */
        .user-menu-container {
          position: relative;
        }
        .user-avatar-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .user-avatar-btn:hover {
          border-color: var(--color-border-hover);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
        }
        .chevron {
          margin-right: 0.25rem;
          transition: transform 0.2s;
          color: var(--color-text-secondary);
        }
        .chevron.open {
          transform: rotate(180deg);
        }

        /* User Dropdown */
        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 200px;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          animation: dropdownFade 0.15s ease;
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .user-dropdown-header {
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-text-primary);
        }
        .user-email {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .user-credits {
          display: inline-block;
          margin-top: 0.25rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-accent-purple);
          background: rgba(124, 58, 237, 0.15);
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
        }
        .user-dropdown-divider {
          height: 1px;
          background: var(--color-border);
        }
        .user-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }
        .user-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-primary);
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
          .auth-buttons .btn-outline span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
