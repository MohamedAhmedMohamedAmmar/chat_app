'use client';

import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { getAuth } from '@/components/auth';

interface SearchUser {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export function NewChatModal() {
  const {
    showNewChatModal,
    setShowNewChatModal,
    handleCreateChat,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  // const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // setSearchResults([]);

    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuth().getToken();
      const response = await axios.post(`${baseUrl}/users/search`,{
        username: searchQuery,
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle single object response - convert to array
      const userData = Array.isArray(response.data) ? response.data : [response.data];
      
      if (userData && userData.length > 0) {
        console.log('Search results:', userData);
        // Automatically create chat with the found user
        await handleSelectUser(userData[0]._id);
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId: string) => {
    await handleCreateChat(userId);
    setShowNewChatModal(false);
    setSearchQuery('');
    // setSearchResults([]);
  };

  if (!showNewChatModal) return null;

  return (
    <div style={{translate:"50% -50%"}} className="fixed top-[50%] right-[50%] w-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Start New Chat</h3>
          <button
            onClick={() => {
              setShowNewChatModal(false);
              setSearchQuery('');
              // setSearchResults([]);
              setError('');
            }}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 w-4 h-4 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Enter username or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-semibold transition flex items-center justify-center gap-2 enabled:cursor-pointer"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                  Creating Chat...
                </>
              ) : (
                'Search & Chat'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}


// export function ChatInfoModal() {
//   const { 
//     chats, 
//     selectedChatId, 
//     showChatInfoModal, 
//     setShowChatInfoModal, 
//     getTwoCharacterOfFAndLName,
//     handleDeleteChat,
//   } = useChat();
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const selectedChat = chats.find((c) => c._id === selectedChatId);
//   const chatName = selectedChat?.displayName || 'Unknown Chat';

//   const handleDelete = async () => {
//     if (!selectedChatId || !window.confirm('Are you sure you want to delete this chat?')) {
//       return;
//     }
    
//     setDeleteLoading(true);
//     try {
//       await handleDeleteChat(selectedChatId);
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   if (!showChatInfoModal || !selectedChat) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
//       <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-sm w-full m-4 max-h-96 overflow-y-auto">
//         <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Chat Info</h3>
//           <button
//             onClick={() => setShowChatInfoModal(false)}
//             className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition"
//           >
//             <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
//               {getTwoCharacterOfFAndLName(chatName)}
//             </div>
//             <div>
//               <p className="font-semibold text-zinc-900 dark:text-white">{chatName}</p>
//               <p className="text-xs text-zinc-600 dark:text-zinc-400">
//                 1-on-1 Chat
//               </p>
//             </div>
//           </div>

//           <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
//             <div>
//               <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Created</p>
//               <p className="text-sm text-zinc-600 dark:text-zinc-400">
//                 {new Date(selectedChat.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//           </div>

//           <button
//               onClick={handleDelete}
//               disabled={deleteLoading}
//               className="w-full py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               {deleteLoading ? (
//                 <>
//                   <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
//                   Deleting...
//                 </>
//               ) : (
//                 'Delete Chat'
//               )}
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// }
