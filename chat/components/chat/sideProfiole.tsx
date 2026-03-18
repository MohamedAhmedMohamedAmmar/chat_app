'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useChat } from '@/context/ChatContext';
import { getAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSave,
  faTimes,
  faSpinner,
  faUserPlus,
  faUserMinus,
  faSearch,
  faCheck,
  faSignOut,
} from '@fortawesome/free-solid-svg-icons';

interface Friend {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface EditFormData {
  username: string;
  email: string;
  bio: string;
  avatar: string;
}

export default function SideProfile() {
  const { user, handleLogout } = useChat();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditFormData>({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });

  // Load initial data
  useEffect(() => {
    const currentToken = getAuth().getToken();
    setToken(currentToken);

    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      fetchFriends(currentToken);
    }
  }, [user]);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const fetchFriends = async (authToken: string | null) => {
    if (!authToken) return;
    try {
      const response = await axios.get(`${baseUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const handleSearchUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/users/search`, {
        username: query,
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const addFriend = async (friendId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/users/friends/add`,
        { friendId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update token if it changed
      if (response.data.token) {
        setToken(response.data.token);
        getAuth().setToken(response.data.token);
      }

      setFriends(response.data.user.friends || []);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to add friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/users/friends/remove`,
        { friendId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update token if it changed
      if (response.data.token) {
        setToken(response.data.token);
        getAuth().setToken(response.data.token);
      }

      setFriends(response.data.user.friends || []);
    } catch (error) {
      console.error('Failed to remove friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${baseUrl}/users/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update token if it changed
      if (response.data.token) {
        setToken(response.data.token);
        getAuth().setToken(response.data.token);
      }

      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
    setEditMode(false);
  };

  if (!user) {
    return (
      <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden">
      {/* Profile Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black dark:text-white">Profile</h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition"
              title="Edit profile"
            >
              <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          )}
        </div>

        {/* Avatar and Basic Info */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          {editMode ? (
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-center mb-2"
            />
          ) : (
            <p className="font-semibold text-zinc-900 dark:text-white">{user.username}</p>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Email Section */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              EMAIL
            </label>
            {editMode ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            ) : (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{user.email}</p>
            )}
          </div>

          {/* Bio Section */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              BIO
            </label>
            {editMode ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Add a bio..."
                className="w-full px-3 py-2 text-sm rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 resize-none"
                rows={3}
              />
            ) : (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {user.bio || 'No bio added yet'}
              </p>
            )}
          </div>

          {/* Edit Mode Buttons */}
          {editMode && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-400 text-white text-sm rounded transition"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                ) : (
                  <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                )}
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-sm rounded transition disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Friends Section */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Friends ({friends.length})
              </h3>
              <button
                onClick={() => setShowAddFriend(!showAddFriend)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition"
                title="Add friend"
              >
                <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Add Friend Section */}
            {showAddFriend && (
              <div className="mb-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 space-y-2">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-3 w-4 h-4 text-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearchUsers}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="flex items-center justify-between p-2 rounded bg-zinc-100 dark:bg-zinc-700"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                            {result.username}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                            {result.email}
                          </p>
                        </div>
                        <button
                          onClick={() => addFriend(result._id)}
                          disabled={loading}
                          className="ml-2 p-1 hover:bg-blue-500 hover:text-white rounded transition disabled:opacity-50"
                          title="Add friend"
                        >
                          <FontAwesomeIcon icon={faUserPlus} className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">No users found</p>
                )}
              </div>
            )}

            {/* Friends List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">No friends yet</p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                        {friend.username}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        {friend.email}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFriend(friend._id)}
                      disabled={loading}
                      className="ml-2 p-1 hover:bg-red-500 hover:text-white rounded transition disabled:opacity-50"
                      title="Remove friend"
                    >
                      <FontAwesomeIcon icon={faUserMinus} className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          <FontAwesomeIcon icon={faSignOut} className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
