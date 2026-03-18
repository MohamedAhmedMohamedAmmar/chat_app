import { IMessage, useChat } from "@/context/ChatContext";
import { faFileImage, faUser, faUserCircle, faX, faStar, faDownload } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FileRenderer from "./Files";
import React from "react";
import { MessageContent } from "./messages";

type Props = {};

function RightSide({}: Props) {
  const { selectedChatId, chats, getTwoCharacterOfFAndLName, messages, starredMessages, handleDeleteChat, setShowChatInfoModal, setShowDeletePopup, user, formatMessageTime, toggleStarMessage } = useChat();
  const selectedChat = chats.find((c) => c._id === selectedChatId);
  const chatMessages = messages.filter((m) => m.chatId === selectedChatId);
  
  const imagesAndFiles = chatMessages.filter(m => m.type !== 'text' && m.fileId);
  
  // derive starred ids for quick lookup
  const starredIds = starredMessages.map(m => m._id);

  // sort starred messages for this chat by star date (descending)
  const starredForChat = chatMessages
    .filter(msg => starredIds.includes(msg._id))
    .map(msg => ({
      ...msg,
      starredAt: starredMessages.find(s => s._id === msg._id)?.starredAt || ''
    }))
    .sort((a, b) => new Date(b.starredAt).getTime() - new Date(a.starredAt).getTime());

  return selectedChat && (
    <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-zinc-900 dark:text-white">Chat Info</h2>
        <button className=" p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer">
        <FontAwesomeIcon onClick={()=>setShowChatInfoModal(false)} icon={faX} className="w-5 h-5" />
        </button>
      </div>
      <div className="w-full h-[.1px] bg-gray-600"></div>
      <div className="flex flex-col items-center space-x-2 mt-5 gap-3">
        <div className="size-17 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
          {getTwoCharacterOfFAndLName(selectedChat.displayName || 'Unknown')}
        </div>
        <span className="text-m text-zinc-700 dark:text-zinc-300">{selectedChat?.displayName}</span>
      </div>
      <div className="w-full h-[.1px] bg-gray-600 mt-4"></div>

      {/* Documents Section */}
      <div className="flex flex-col gap-2 mt-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Documents</h3>
        {imagesAndFiles.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto max-h-56">
            {imagesAndFiles.map((message) => (
              <div key={message._id} className="flex flex-col gap-1 shrink-0 w-32 h-40">
                {message.type === 'image' && message.fileId && typeof message.fileId === 'string' && (
                  <div className="w-full h-32 overflow-hidden rounded-lg">
                    <FileRenderer 
                      fileId={message.fileId} 
                      fileName={message.content} 
                      fileType="image"
                      messageType="image"
                    />
                  </div>
                )}
                {message.type === 'video' && message.fileId && typeof message.fileId === 'string' && (
                  <div className="w-full h-32 overflow-hidden rounded-lg">
                    <FileRenderer 
                      fileId={message.fileId} 
                      fileName={message.content} 
                      fileType="video"
                      messageType="video"
                    />
                  </div>
                )}
                {message.type === 'file' && message.fileId && typeof message.fileId === 'string' && (
                  <div className="w-full h-32 overflow-hidden rounded-lg">
                    <FileRenderer 
                      fileId={message.fileId} 
                      fileName={message.content} 
                      fileType="file"
                      messageType="file"
                    />
                  </div>
                )}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-1">{message.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-3">No documents available.</p>
        )}
      </div>

      {/* Starred Messages Section */}
      <div className="flex flex-col gap-2 mt-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-500" />
          Starred Messages
        </h3>
        {starredForChat.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {starredForChat.map((message: any) => (
              <div
                key={message._id}
                className={`max-w-xs px-4 py-2 rounded-lg relative ${
                  message.sender === user?._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                }`}
              >
                <MessageContent message={message} />
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleString().split(",")[0]+"  "+ formatMessageTime(message.timestamp)}
                </p>

                {/* Star button */}
                <button
                  onClick={() => toggleStarMessage(message._id, starredIds.includes(message._id))}
                  className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600 cursor-pointer"
                  title="Unstar message"
                >
                  <FontAwesomeIcon
                    icon={faStar}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-3">No starred messages.</p>
        )}
      </div>

      {/* Delete Chat Button */}
      <button
        onClick={() => selectedChatId && setShowDeletePopup(true)}
        className="w-70 cursor-pointer right-4 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md mt-5 absolute bottom-5"
      >
        Delete chat
      </button>
    </div>
  );
}

export default RightSide;
