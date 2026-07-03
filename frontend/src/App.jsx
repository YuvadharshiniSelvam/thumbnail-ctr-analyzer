import React, { useState } from 'react';
import UploadBox from './components/UploadBox';
import ResultCard from './components/ResultCard';
import FeatureGrid from './components/FeatureGrid';

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");

  const handleUpload = (file) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setYoutubeUrl(""); // Clear URL if file uploaded
    setResult(null);
    setError(null);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    
    setImageFile(null); // Clear file if URL provided
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    handlePredictUrl(youtubeUrl);
  };

  const handlePredictFile = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', imageFile);
    if (videoTitle.trim()) {
      formData.append('title', videoTitle);
    }

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePredictUrl = async (url) => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('url', url);
    if (videoTitle.trim()) {
      formData.append('title', videoTitle);
    }

    try {
      const response = await fetch('http://localhost:8000/predict-url', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'URL Prediction failed');
      }

      const data = await response.json();
      setPreviewUrl(data.thumbnail_url); // Set preview from the fetched thumbnail
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-blue/30 flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-16 md:py-24">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-widest uppercase text-white drop-shadow-2xl">
            Thumbnail CTR<br/>Analyzer
          </h1>
          <p className="mt-6 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide">
            WE OFFER PRECISE PREDICTIONS FOR YOUTUBE THUMBNAILS. UPLOAD A FILE OR PASTE A LINK.
          </p>
        </header>

        <main className="space-y-12">
          <div className="bg-brand-card/80 p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
            {/* Subtle glow border effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Video Title Input */}
            <div className="mb-8 relative z-10">
              <label className="block text-xs font-display tracking-widest uppercase text-gray-400 mb-3">
                Video Title (Optional — Enables alignment analysis)
              </label>
              <input 
                type="text" 
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter your video title here (e.g., 'I built a spaceship in 24 hours')..."
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 text-white placeholder-gray-500 font-light"
              />
            </div>

            <form onSubmit={handleUrlSubmit} className="mb-8 flex flex-col md:flex-row gap-4 relative z-10">
              <input 
                type="text" 
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube Video URL here..."
                className="flex-1 bg-brand-dark/50 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 text-white placeholder-gray-500 font-light"
              />
              <button 
                type="submit"
                disabled={!youtubeUrl.trim() || isUploading}
                className="px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white font-display uppercase tracking-widest text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(45,107,255,0.3)] hover:shadow-[0_0_30px_rgba(45,107,255,0.5)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 whitespace-nowrap"
              >
                {isUploading && !imageFile ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Analyze URL'
                )}
              </button>
            </form>

            <div className="flex items-center gap-6 mb-8 relative z-10">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-gray-500 text-xs font-display tracking-widest uppercase">Or upload file</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <div className="relative z-10">
              <UploadBox 
                onUpload={handleUpload} 
                isUploading={isUploading && imageFile !== null} 
                previewImage={previewUrl} 
              />
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center text-sm tracking-wide font-light">
                {error}
              </div>
            )}

            {imageFile && (
              <div className="mt-8 flex justify-center relative z-10">
                <button
                  onClick={handlePredictFile}
                  disabled={isUploading}
                  className="px-10 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white font-display uppercase tracking-widest text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(45,107,255,0.4)] hover:shadow-[0_0_40px_rgba(45,107,255,0.6)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {isUploading && imageFile ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing File...
                    </>
                  ) : (
                    'Predict CTR'
                  )}
                </button>
              </div>
            )}
          </div>

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
              <ResultCard 
                prediction={result.prediction} 
                confidence={result.confidence} 
              />
              <FeatureGrid features={result.features} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
