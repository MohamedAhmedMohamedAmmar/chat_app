'use client';

import { useChat } from '@/context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function ChatHeader() {
  const { chats, selectedChatId, showChatInfoModal, setShowChatInfoModal, getTwoCharacterOfFAndLName, user, getUserStatus, onlineUsers } = useChat();
  const [selectedChat, setSelectedChat] = useState(chats.find((c) => c._id === selectedChatId));
  const [userStatus, setUserStatus] = useState('Offline');

  const otherParticipant = selectedChat?.participantIds.filter(u => u._id != user?._id)[0];
  const chatName = otherParticipant?.username || 'Unknown Chat';
  const chatUserId = otherParticipant?._id;

  if (!selectedChat) return null;
  
  useEffect(() => {
    const chat = chats.find((c) => c._id === selectedChatId);
    if (chat) {
        console.log("Selected chat updated:", chat);
        
      setSelectedChat(chat);
    }
  }, [selectedChatId, chats]);

  useEffect(() => {
    if (chatUserId) {
      console.log(chatUserId);
      
      setUserStatus(getUserStatus(chatUserId));
    }
  }, [chatUserId, onlineUsers]);
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {getTwoCharacterOfFAndLName(chatName)}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{chatName}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {userStatus}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowChatInfoModal(!showChatInfoModal)}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <FontAwesomeIcon icon={faEllipsis} className="text-zinc-600 dark:text-zinc-400 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
