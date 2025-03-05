import React, { useState, useEffect } from 'react';

const WelcomeSection = ({ handleGoogleLogin }: { handleGoogleLogin: () => void }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Rotating Tips
  const tips = [
    "🔍 OCR (Optical Character Recognition) helps digitize printed and handwritten text!",
    "📸 snapNote uses Google Cloud Vision API for high accuracy!",
    "📖 Extract text from receipts, notes, books, and more!",
    "💰 Using your own API key lets you extract unlimited text!",
    "⏳ No need to type manually—let AI do the work!",
    "📄 Supports multiple image formats like PNG, JPG, and JPEG.",
    "🔗 Extract URLs, email addresses, and phone numbers from images!",
    "🌍 Works in multiple languages, not just English!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 4000); // Change tip every 4 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle Image Preview
  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-10 rounded-xl shadow-lg max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to <span className="text-blue-600">snapNote!</span>
      </h2>
      <p className="text-gray-600 mb-6">
        Log in to extract text from your images effortlessly.
      </p>
      <button 
        onClick={handleGoogleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 flex items-center space-x-3"
      >
        {/* Inline SVG for Google Logo */}
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M44.5 20H24v8.5h11.8c-1.1 4.7-5.1 8.5-11.8 8.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.2 3l6-6C33.3 3.4 28.1 1 24 1 12.4 1 3 10.4 3 22s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.3-4z"/>
        </svg>
        <span>Login with Google</span>
      </button>

      {/* Live Rotating Tips */}
      <div className="mt-6 p-4 bg-blue-100 text-blue-700 rounded-lg shadow-md text-sm font-medium transition-all">
        {tips[tipIndex]}
      </div>
    </div>
  );
};

export default WelcomeSection;
