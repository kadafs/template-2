'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';
import Image from 'next/image';

interface GeneratedImage {
  imageUrl: string;
  width: number;
  height: number;
}

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [showImages, setShowImages] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  
  const generateImage = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      
      // Add all new images to the beginning of the array
      setImages(prev => [...data.images, ...prev]);
      setShowImages(true);
    } catch (error) {
      setError('Failed to generate image. Please try again.');
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !loading) {
      await generateImage();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    setError(''); // Clear error when input changes
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  return (
    <main className="min-h-screen">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">Image Generator</h1>
      </div>

      {/* Input Field */}
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want to generate..."
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-purple-50 border border-purple-100 
                       focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300
                       placeholder-purple-300 text-gray-700 disabled:opacity-50"
          />
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     px-4 py-1.5 bg-purple-600 text-white rounded-md
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50
                     disabled:cursor-not-allowed text-sm"
          >
            Generate
          </button>
        </div>
        {loading && (
          <div className="mt-4 text-center text-purple-600">
            Generating your masterpieces...
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Image Grid */}
      {showImages && images.length > 0 && (
        <div className="image-grid">
          {images.map((image, i) => (
            <div key={`${image.imageUrl}-${i}`} className="relative group">
              <div className="relative aspect-square">
                <Image
                  src={image.imageUrl}
                  alt={`Generated image ${i + 1}`}
                  fill
                  className="rounded-lg object-cover transition-all group-hover:brightness-75"
                />
                <button
                  onClick={() => handleDownload(image.imageUrl)}
                  className="absolute right-2 top-2 p-2 bg-white/80 hover:bg-white 
                           rounded-full shadow-lg opacity-0 group-hover:opacity-100 
                           transition-opacity duration-200 focus:outline-none 
                           focus:ring-2 focus:ring-purple-500"
                  title="Download image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
