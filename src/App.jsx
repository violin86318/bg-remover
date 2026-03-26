import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ImageProcessor from './components/ImageProcessor';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import HistoryModal from './components/HistoryModal';
import Pricing from './components/Pricing';
import { loadUser, saveUser, clearUser, saveUserToBackend } from './utils/googleAuth';

export default function App() {
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [error, setError] = useState(null);
  const [isPricing, setIsPricing] = useState(window.location.hash === '#pricing');

  // Load saved user on mount
  useEffect(() => {
    const savedUser = loadUser();
    if (savedUser) setUser(savedUser);
  }, []);

  // Hash-based routing for Pricing page
  useEffect(() => {
    const handleHashChange = () => {
      setIsPricing(window.location.hash === '#pricing');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = useCallback(async (userData) => {
    // Upsert user to D1 via API and get updated user with credits
    try {
      const savedUser = await saveUserToBackend(userData);
      // Merge backend data (credits, subscription) into local user object
      const fullUser = { ...userData, ...savedUser };
      saveUser(fullUser);
      setUser(fullUser);
    } catch (err) {
      console.error('Failed to save user to backend:', err);
      saveUser(userData);
      setUser(userData);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearUser();
    setUser(null);
    setShowHistory(false);
  }, []);

  const handleFileSelect = useCallback(async (file) => {
    setError(null);
    setProcessedImage(null);

    const originalUrl = URL.createObjectURL(file);
    setOriginalPreview(originalUrl);
    setSelectedFile(file);
    setStatus('processing');

    setTimeout(() => {
      document.getElementById('processor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const headers = {};
      // Pass credential if user is logged in (for usage logging)
      if (user?.credential) {
        headers['Authorization'] = `Bearer ${user.credential}`;
      }

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to remove background. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Received empty response. Please try again.');

      const processedUrl = URL.createObjectURL(blob);
      setProcessedImage(processedUrl);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, [user]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setOriginalPreview(null);
    setProcessedImage(null);
    setStatus('idle');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onShowHistory={() => setShowHistory(true)}
      />

      {isPricing ? (
        <Pricing user={user} />
      ) : (
        <main>
          <Hero onFileSelect={handleFileSelect} />

          {status !== 'idle' && (
            <ImageProcessor
              originalPreview={originalPreview}
              processedImage={processedImage}
              status={status}
              error={error}
              onReset={handleReset}
            />
          )}

          {status === 'idle' && (
            <>
              <Features />
              <HowItWorks />
              <FAQ />
            </>
          )}
        </main>
      )}

      {!isPricing && <Footer />}

      {showHistory && user && (
        <HistoryModal user={user} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
