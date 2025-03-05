import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiKeyManagerProps {
  token: string | null;
  onClose: () => void;
  hasCustomKey?: boolean;
}

const ApiKeyManager = ({ token, onClose, hasCustomKey }: ApiKeyManagerProps) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Handle Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setError('Please enter a valid API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate JSON format if it's a service account key
      try {
        JSON.parse(apiKey);
      } catch (e) {
        setError('Invalid JSON format. Please enter a valid Google Cloud service account key');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/save-api-key', {
        token,
        apiKey
      });

      if (response.data.success) {
        setSuccess('API key saved successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to save API key. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://127.0.0.1:5000/clear-api-key', {
        token
      });

      if (response.data.success) {
        setSuccess('API key removed successfully!');
        setShowRemoveConfirm(false);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to remove API key. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto relative">
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">
          {hasCustomKey ? 'Manage API Key' : 'Add Your API Key'}
        </h2>

        {!showRemoveConfirm ? (
          <>
            <p className="mb-4 text-gray-600">
              {hasCustomKey
                ? 'You are currently using your own Google Cloud Vision API key. You can update or remove it below.'
                : 'Enter your Google Cloud Vision API service account key (JSON format) to use your own API quota.'}
            </p>

            <textarea
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Google Cloud Vision API service account key (JSON format) here"
              className="w-full h-32 mb-4 rounded-lg border border-gray-300 resize-y p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mb-6">
              <p className="font-bold mb-2 text-gray-700">How to get your API key:</p>
              <ol className="list-decimal pl-5 text-gray-600">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
                <li>Create a new project (or select an existing one)</li>
                <li>Enable the Vision API for your project</li>
                <li>Go to "APIs & Services" `{'>'} "Credentials"</li>
                <li>Click "Create credentials"`{'>'} "Service account"</li>
                <li>Fill in the service account details and click "Create"</li>
                <li>Click on the service account you just created</li>
                <li>Go to the "Keys" tab and click "Add key" `{'>'} "Create new key"</li>
                <li>Select "JSON" key type and click "Create"</li>
                <li>Copy the entire content of the downloaded JSON file and paste it below</li>
              </ol>
              <p className="mt-4 text-gray-600">You can also watch this video for a step-by-step guide:</p>
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/I1dv2bOYhds"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full max-w-full mt-2 rounded-lg"
              ></iframe>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="flex justify-between mt-6">
              {hasCustomKey && (
                <button
                  onClick={() => setShowRemoveConfirm(true)}
                  className={`py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  Remove API Key
                </button>
              )}

              <div className="ml-auto flex gap-3">
                <button
                  onClick={onClose}
                  className={`py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveApiKey}
                  className={`py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save API Key'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div>
            <p className="mb-4 text-gray-600">
              Are you sure you want to remove your API key? You will start using your free usage allowance again.
            </p>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className={`py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleRemoveApiKey}
                className={`py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;