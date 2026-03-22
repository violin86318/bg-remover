import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ImageProcessor from './components/ImageProcessor';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { loadUser, saveUser, clearUser, saveUserToBackend } from './utils/googleAuth';

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [error, setError] = useState(null);

  // Load saved user on mount
  useEffect(() => {
    const savedUser = loadUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = useCallback(async (userData) => {
    // Upsert user to D1 via API (fire and forget, don't block UI on error)
    try {
      await saveUserToBackend(userData);
    } catch (err) {
      console.error('Failed to save user to backend:', err);
    }
    saveUser(userData);
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    clearUser();
    setUser(null);
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

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
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
  }, []);

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
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
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
      <Footer />
    </div>
  );
}
