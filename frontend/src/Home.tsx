import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from 'firebase/auth';
import ApiKeyManager from './ApiKeyManager';

interface UsageStats {
  remaining_uses: number;
  has_custom_key: boolean;
  api_usage_count: number;
}

interface HomeProps {
  user: User | null;
  token: string | null;
}

const Home: React.FC<HomeProps> = ({ user, token }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showApiKeyManager, setShowApiKeyManager] = useState<boolean>(false);

  // Fetch usage stats when component mounts or token changes
  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!token) return;

      try {
        const response = await axios.post('http://127.0.0.1:5000/get-usage-stats', {
          token
        });
        setUsageStats(response.data);
      } catch (err) {
        console.error('Failed to fetch usage stats:', err);
      }
    };

    fetchUsageStats();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    setLoading(true);
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
      });

      setText(response.data.text);
      
      // Update usage stats if available
      if (response.data.remaining_uses !== undefined) {
        setUsageStats(prev => prev ? {
          ...prev,
          remaining_uses: response.data.remaining_uses,
          api_usage_count: (prev.api_usage_count || 0) + 1
        } : null);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setError('You have reached your free usage limit. Please add your own API key.');
        setShowApiKeyManager(true);
      } else {
        setError('Failed to extract text. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl mb-4">Welcome to snapNote</h2>
        <p className="mb-4">Please log in to start using the application</p>
      </div>
    );
  }

  return (
    <div>
      {/* Usage Stats */}
      {usageStats && (
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h3 className="font-bold mb-2">Usage Statistics</h3>
          {usageStats.has_custom_key ? (
            <p>Using custom API key</p>
          ) : (
            <>
              <p>Remaining free uses: {usageStats.remaining_uses}</p>
              <p>Total API calls: {usageStats.api_usage_count}</p>
            </>
          )}
          {!usageStats.has_custom_key && (
            <button 
              onClick={() => setShowApiKeyManager(true)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              Add API Key
            </button>
          )}
        </div>
      )}

      {/* Image Upload and Text Extraction */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
          />
          <button
            type="submit"
            disabled={loading || !file}
            className={`px-4 py-2 bg-blue-500 text-white rounded 
              ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Extracting...' : 'Extract Text'}
          </button>
        </div>
      </form>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      {/* Extracted Text */}
      {text && (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Extracted Text:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            {text}
          </pre>
        </div>
      )}

      {/* API Key Manager Modal */}
      {showApiKeyManager && (
        <ApiKeyManager 
          token={token} 
          onClose={() => setShowApiKeyManager(false)}
          hasCustomKey={usageStats?.has_custom_key}
        />
      )}
    </div>
  );
};

export default Home;