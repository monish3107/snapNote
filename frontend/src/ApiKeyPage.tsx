import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ApiKeyPageProps {
  token: string | null;
  hasCustomKey?: boolean;
}

const ApiKeyPage = ({ token, hasCustomKey }: ApiKeyPageProps) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setError('Please enter a valid API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate JSON format
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
          navigate('/'); // Redirect to home page
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
          navigate('/'); // Redirect to home page
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{hasCustomKey ? 'Manage API Key' : 'Add Your API Key'}</h1>

      {!showRemoveConfirm ? (
        <>
          <p className="mb-3">
            {hasCustomKey
              ? 'You are currently using your own Google Cloud Vision API key. You can update or remove it below.'
              : 'Enter your Google Cloud Vision API service account key (JSON format) to use your own API quota.'}
          </p>

          <textarea
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Google Cloud Vision API service account key (JSON format) here"
            className="w-full h-24 mb-3 rounded border border-gray-300 resize-y p-2"
          />

          {error && <p className="text-red-500 mb-3">{error}</p>}
          {success && <p className="text-green-500 mb-3">{success}</p>}

          <div className="flex justify-between mt-4">
            {hasCustomKey && (
              <button
                onClick={() => setShowRemoveConfirm(true)}
                className={`py-2 px-3 bg-red-600 text-white border-none rounded cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                Remove API Key
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={() => navigate('/')}
                className="py-2 px-3 bg-gray-500 text-white border-none rounded cursor-pointer mr-3"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveApiKey}
                className={`py-2 px-3 bg-green-600 text-white border-none rounded cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div>
          <p className="mb-3">Are you sure you want to remove your API key? You will start using your free usage allowance again.</p>

          {error && <p className="text-red-500 mb-3">{error}</p>}
          {success && <p className="text-green-500 mb-3">{success}</p>}

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowRemoveConfirm(false)}
              className="py-2 px-3 bg-gray-500 text-white border-none rounded cursor-pointer mr-3"
            >
              Cancel
            </button>

            <button
              onClick={handleRemoveApiKey}
              className={`py-2 px-3 bg-red-600 text-white border-none rounded cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyPage;
