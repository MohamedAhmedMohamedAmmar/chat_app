"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useChat } from "@/context/ChatContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMessage,
  faSignOut,
  faUser,
  faEllipsis,
  faDownload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getAuth } from "@/components/auth";

export default function ChatSidebar() {
  const {
    user,
    chats,
    selectedChatId,
    setSelectedChatId,
    setShowNewChatModal,
    isProfileMenuOpen,
    setIsProfileMenuOpen,
    isDropdownOpen,
    setIsDropdownOpen,
    handleLogout,
    getTwoCharacterOfFAndLName,
    getLastSeenText,
    getUserStatus,
  } = useChat();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileMenuOpen]);



  const handleNewChat = async () => {
    setShowNewChatModal(true);
    // setIsDropdownOpen(false);
  };


  return (
    <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Chats
          </h1>
          <div className="flex gap-2">
            {/* New Chat Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                title="New Chat"
                onClick={() => handleNewChat()}
                className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-sm bg-zinc-200 dark:bg-blue-950 hover:bg-zinc-300 dark:hover:bg-blue-900 transition"
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  className="text-zinc-600 dark:text-zinc-300 text-sm"
                />
              </button>

              {/* {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleNewChat}
                    className="w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 transition"
                  >
                    <FontAwesomeIcon icon={faMessage} className="w-4 h-4" />
                    <span>New Chat</span>
                  </button>
                </div>
              )} */}
            </div>

            {/* Profile Menu */}
            <div ref={profileMenuRef} className="relative">
              <button title="log out" onClick={handleLogout} className="w-full px-2 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition cursor-pointer rounded-sm">
                <FontAwesomeIcon icon={faSignOut} />
              </button>
              {/* <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
              >
                <FontAwesomeIcon icon={faEllipsis} className="text-zinc-600 dark:text-zinc-300 text-sm" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
                  <Link href="/profile" className="block">
                    <button className="w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 transition border-b border-zinc-100 dark:border-zinc-700">
                      <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition"
                  >
                    <FontAwesomeIcon icon={faSignOut} className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-zinc-800">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 text-white font-semibold text-xs">
            {user?.username ? getTwoCharacterOfFAndLName(user.username) : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Chat List - Vertical Column Layout */}
      <div className="flex-1 flex-col overflow-x-hidden overflow-y-auto p-2 pb-4">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center whitespace-nowrap">
              No chats yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2 px-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                ref={activeChatMenu === chat._id ? chatMenuRef : null}
                className="relative shrink-0"
              >
                <div
                  onClick={() => {
                    console.log(chat._id);
                    setSelectedChatId(chat._id);
                  }}
                  className={`w-full p-3 rounded-lg cursor-pointer transition border ${
                    selectedChatId === chat._id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 scale-105"
                      : "bg-white dark:bg-zinc-800 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {getTwoCharacterOfFAndLName(
                        chat.participantIds.filter((u) => u._id !== user?._id)[0]
                          ?.username || "Unknown",
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                        {chat.participantIds.filter(
                          (u) => u._id !== user?._id,
                        )[0]?.username || "Unknown"}
                      </p>
                      <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                      <p className="pt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        {getUserStatus(
                          chat.participantIds.filter((u) => u._id !== user?._id)[0]?._id || "",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Options Menu - Dropdown */}
                {/* <button
                  onClick={() => setActiveChatMenu(activeChatMenu === chat._id ? null : chat._id)}
                  className="absolute top-1 right-1 p-1"
                >
                  <FontAwesomeIcon icon={faEllipsis} className="w-4 h-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                </button> */}

                {/* {activeChatMenu === chat._id && (
                  <div className="absolute right-0 top-8 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => {
                        handleDownloadChat(chat._id, chat.displayName || 'chat');
                        setActiveChatMenu(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition border-b border-zinc-100 dark:border-zinc-700"
                    >
                      <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteChat(chat._id);
                        setActiveChatMenu(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
