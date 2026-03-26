import { useState, useEffect } from 'react';

export default function HistoryModal({ user, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.credential) return;

    fetch('/api/history', {
      headers: {
        'Authorization': `Bearer ${user.credential}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.history);
        } else {
          setError(data.message || 'Failed to load history');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Usage History</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {loading && <p className="loading-text">Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && history.length === 0 && (
            <p className="empty-text">No usage history yet. Try removing some backgrounds!</p>
          )}
          {!loading && !error && history.length > 0 && (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="history-info">
                    <span className="history-filename">{item.original_filename}</span>
                    <span className="history-date">{formatDate(item.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-content {
          background: #1a1a2e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .modal-header h2 {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .modal-body {
          padding: 1rem 1.5rem 1.5rem;
          overflow-y: auto;
        }
        .loading-text, .empty-text, .error-text {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          padding: 2rem 0;
        }
        .error-text {
          color: #f87171;
        }
        .history-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .history-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .history-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(124, 58, 237, 0.15);
          color: #a78bfa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .history-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .history-filename {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .history-date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
