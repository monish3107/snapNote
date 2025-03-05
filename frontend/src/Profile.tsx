import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import ApiKeyManager from './ApiKeyManager';

interface UsageStats {
  remaining_uses: number;
  has_custom_key: boolean;
  api_usage_count: number;
}

interface ProfileProps {
  user: User | null;
  token: string | null;
  usageStats: UsageStats | null;
}

const Profile: React.FC<ProfileProps> = ({ user, token, usageStats }) => {
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // Log changes to user, token, or usageStats
  useEffect(() => {
    console.log('User updated:', user);
    console.log('Token updated:', token);
    console.log('Usage stats updated:', usageStats);
  }, [user, token, usageStats]);

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        
        {/* User Information */}
        <div className="mb-6">
          {user.photoURL && !profileImageError ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-24 h-24 rounded-full mx-auto mb-4" 
              onError={() => setProfileImageError(true)} // Switch to fallback if image fails to load
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-blue-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {getInitials(user.displayName || 'U')}
              </span>
            </div>
          )}
          <h2 className="text-xl text-center font-semibold">{user.displayName}</h2>
          <p className="text-gray-600 text-center">{user.email}</p>
        </div>

        {/* Usage Statistics */}
        {usageStats && (
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <h3 className="text-lg font-bold mb-3">Usage Statistics</h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span>API Key Status:</span>
                <span className="font-bold">
                  {usageStats.has_custom_key ? 'Custom API Key' : 'Free Credits'}
                </span>
              </p>
              {!usageStats.has_custom_key && (
                <p className="flex justify-between">
                  <span>Remaining Free Uses:</span>
                  <span className="font-bold">{usageStats.remaining_uses}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span>Total API Calls:</span>
                <span className="font-bold">{usageStats.api_usage_count}</span>
              </p>
            </div>
          </div>
        )}

        {/* API Key Management */}
        <div>
          <h3 className="text-lg font-bold mb-3">API Key Management</h3>
          <button
            onClick={() => setShowApiKeyManager(true)}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {usageStats?.has_custom_key ? 'Manage API Key' : 'Add API Key'}
          </button>
        </div>
      </div>

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

export default Profile;