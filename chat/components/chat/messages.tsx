'use client';

import { IMessage, useChat } from '@/context/ChatContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPaperPlane, faPaperclip, faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { useEffect, useState, useRef } from 'react';
import FileRenderer from './Files';
export const MessageContent = ({ message }: { message: IMessage }) => {
  if (message.type === 'text') {
    return (
      <p className="text-sm" style={{ wordWrap: 'break-word' }}>
        {message.content}
      </p>
    );
  }

  if (message.type === 'image' && message.fileId && typeof message.fileId === 'string') {
    return (
      <FileRenderer 
        fileId={message.fileId} 
        fileName={message.content} 
        fileType="image"
        messageType="image"
      />
    );
  }

  if (message.type === 'video' && message.fileId && typeof message.fileId === 'string') {
    return (
      <FileRenderer 
        fileId={message.fileId} 
        fileName={message.content} 
        fileType="video"
        messageType="video"
      />
    );
  }

  if (message.type === 'file' && message.fileId && typeof message.fileId === 'string') {
    return (
      <FileRenderer 
        fileId={message.fileId} 
        fileName={message.content} 
        fileType="file"
        messageType="file"
      />
    );
  }

  return null;
};

export default function ChatMessages() {
  const {
    selectedChatId,
    messages,
    messageInput,
    setMessageInput,
    loadingMessages,
    user,
    chats,
    messagesEndRef,
    formatMessageTime,
    handleSendMessage,
    handleFileUpload,
    toggleStarMessage,
    starredMessages
} = useChat();
const [selectedMessages, setSelectedMessages] = useState<IMessage[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChat = chats.find((c) => c._id === selectedChatId);

  // Check if two messages are from different days
  const isDifferentDay = (message1: IMessage, message2: IMessage | null): boolean => {
    if (!message2) return true;
    const date1 = new Date(message1.timestamp).toLocaleDateString();
    const date2 = new Date(message2.timestamp).toLocaleDateString();
    return date1 !== date2;
  };

  // Format date for separator
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toLocaleDateString() === today.toLocaleDateString()) {
      return 'Today';
    } else if (date.toLocaleDateString() === yesterday.toLocaleDateString()) {
      return 'Yesterday';
    } else {
      const dateStr = date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric'});
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${dateStr}`;
    }
  };

  useEffect(()=>{
    const filteredMessages = messages.filter((m) => m.chatId === selectedChatId);
    setSelectedMessages(filteredMessages);
    console.log("messages updated:", filteredMessages);
    console.log(selectedChatId);
  },[messages, selectedChatId]);

  // Auto-scroll to bottom when messages are loaded or filtered
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }, [selectedMessages]);
  return (
    <>
      {/* Messages Area - Fixed height with proper scrolling */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-148px)] scrollbar" // Adjust height based on header and input
        style={{
          display: 'flex',
          flexDirection: 'column',
        //   height: 'auto',
        //   minHeight: 0,
        }}
      >
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-zinc-400 w-6 h-6" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          selectedMessages.map((message, index) => (
            <div key={message._id}>
              {/* Date separator */}
              {isDifferentDay(message, selectedMessages[index - 1] || null) && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 border-t border-zinc-300 dark:border-zinc-600"></div>
                  <span className="px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900">
                    {formatDate(message.timestamp)}
                  </span>
                  <div className="flex-1 border-t border-zinc-300 dark:border-zinc-600"></div>
                </div>
              )}
              {/* Message */}
              <div
                className={`flex ${message.sender === user?._id ? 'justify-end' : 'justify-start'} group mb-1`}
              >
                <div
                  className={`max-w-xs rounded-lg relative ${
                    message.sender === user?._id
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <div className="px-4 pt-2">
                    <MessageContent message={message} />
                  </div>
                  
                  {/* Message time and actions */}
                  <div className="flex items-center justify-between px-4 pb-1 gap-2">
                    <p className="text-xs opacity-70 whitespace-nowrap">
                      {formatMessageTime(message.timestamp)}
                    </p>
                    
                    {/* Star button on hover */}
                    <button
                      onClick={() => toggleStarMessage(message._id ,starredMessages.some((m) => m._id === message._id))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                      title="Star message"
                    >
                      <FontAwesomeIcon
                        icon={starredMessages.some((m) => m._id === message._id) ? faStar : faStarRegular}
                        className="w-3 h-3 text-yellow-500 hover:text-yellow-600"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shrink-0">
        <div className="flex items-end gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <FontAwesomeIcon icon={faPaperclip} className="text-zinc-600 dark:text-zinc-400 w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white transition"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
