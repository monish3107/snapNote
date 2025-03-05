import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, UserCredential } from 'firebase/auth';
import { Copy, Download, FileText, CheckCircle, X, Upload } from 'lucide-react';
import Profile from './Profile';
import About from './About';
import WelcomeSection from './WelcomeSection';

// TypeScript interfaces
interface UsageStats {
  remaining_uses: number;
  has_custom_key: boolean;
  api_usage_count: number;
}

function App() {
  // State Management
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  // Authentication Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const idToken = await user.getIdToken();
        setToken(idToken);
        fetchUsageStats(idToken);
      } else {
        setUser(null);
        setToken(null);
        setUsageStats(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Usage Stats
  const fetchUsageStats = async (idToken: string) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/get-usage-stats', {
        token: idToken
      });
      setUsageStats(response.data);
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
    }
  };

  // File Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Clear Uploaded Image and Extracted Text
  const handleClearImage = () => {
    setFile(null);
    setImagePreview(null);
    setText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    if (!user) {
      setError('Please log in to extract text.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');
    setText('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('token', token || '');

    try {
      const response = await axios.post('http://127.0.0.1:5000/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 50) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        },
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = 50 + Math.round((progressEvent.loaded * 50) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        }
      });
      setText(response.data.text);
      setProgress(100);
    } catch (err) {
      setError('Failed to extract text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Text Action Handlers
  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Authentication Handlers
  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then(async (result: UserCredential) => {
        setUser(result.user);
        const idToken = await result.user.getIdToken();
        setToken(idToken);
        fetchUsageStats(idToken);
      })
      .catch((error) => {
        console.error('Login Failed:', error);
      });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setToken(null);
        setUsageStats(null);
        setFile(null);
        setImagePreview(null);
        setText('');
      })
      .catch((error) => {
        console.error('Logout Failed:', error);
      });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition duration-300">
                snapNote
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/about" className="text-gray-600 hover:text-gray-800 transition duration-200">
                  About
                </Link>
                {user && (
                  <Link to="/profile" className="text-gray-600 hover:text-gray-800 transition duration-200">
                    Profile
                  </Link>
                )}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-300 flex items-center space-x-2"
                  >
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <Routes>
            {/* Home Page - Shows WelcomeSection if user is not logged in */}
            <Route
              path="/"
              element={user ? (
                <div className="text-center text-gray-700">
                  <h1 className="text-3xl font-bold">Welcome Back, {user.displayName}!</h1>
                  <p className="mt-4">You can now upload images and extract text.</p>
                  {/* Image Upload Section */}
                  <section className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mt-6">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                      Image to Text Converter
                    </h2>
                    <form className="flex flex-col items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                      />
                      <label
                        htmlFor="fileInput"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 cursor-pointer"
                      >
                        <Upload size={20} />
                        <span>{file ? file.name : 'Upload Image'}</span>
                      </label>

                      {/* Image Preview with Close Button */}
                      {imagePreview && (
                        <div className="relative mt-4">
                          <img 
                            src={imagePreview} 
                            alt="Uploaded" 
                            className="max-w-xs max-h-72 rounded-xl shadow-md object-cover"
                          />
                          <button
                            onClick={handleClearImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition flex items-center justify-center"
                            style={{ width: '24px', height: '24px' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      {/* Extract Button */}
                      {file && (
                        <button 
                          onClick={handleSubmit}
                          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
                        >
                          Extract Text
                        </button>
                      )}

                      {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                          <div 
                            className="h-3 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      )}
                    </form>
                  </section>

                  {/* Extracted Text Section */}
                  {text && (
                    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Extracted Text</h3>
                        <div className="flex space-x-4">
                          <button 
                            onClick={handleCopyText}
                            className="text-gray-600 hover:text-gray-800 transition duration-300"
                            title={copied ? 'Copied!' : 'Copy Text'}
                          >
                            {copied ? <CheckCircle color="#10B981" /> : <Copy />}
                          </button>
                          <button 
                            onClick={handleDownloadText}
                            className="text-gray-600 hover:text-gray-800 transition duration-300"
                            title="Download Text"
                          >
                            <Download />
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto flex items-start space-x-3">
                        <FileText size={20} className="text-gray-500 flex-shrink-0 mt-1" />
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words flex-grow">
                          {text}
                        </pre>
                      </div>
                    </section>
                  )}

                  {/* Usage Stats Section */}
                  {usageStats && (
                    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6 max-w-md mx-auto">
                      <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
                        Usage Statistics
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">API Key Status</span>
                          <span className="font-semibold text-blue-600">
                            {usageStats.has_custom_key ? 'Custom API Key' : 'Free Credits'}
                          </span>
                        </div>
                        {!usageStats.has_custom_key && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Remaining Free Uses</span>
                            <span className="font-semibold text-green-600">
                              {usageStats.remaining_uses}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total API Calls</span>
                          <span className="font-semibold text-indigo-600">
                            {usageStats.api_usage_count}
                          </span>
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <WelcomeSection handleGoogleLogin={handleGoogleLogin} />
              )}
            />
            <Route path="/profile" element={<Profile user={user} token={token} usageStats={usageStats} />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );

}

export default App;