"use client";

import { ChatProvider, useChat } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/sideChat";
import ChatHeader from "@/components/chat/chat";
import ChatMessages from "@/components/chat/messages";
import SideProfile from "@/components/chat/sideProfiole";
import { NewChatModal } from "@/components/chat/info";
import RightSide from "@/components/chat/rightSide";
import DeletePopup from "@/components/chat/deletePopup";
import "./style.scss";
function ChatContent() {
  const { loading, socketConnected, selectedChatId, showChatInfoModal, showDeletePopup,showNewChatModal } =
    useChat();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">Loading chat...</p>
      </div>
    );
  }

  if (!socketConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <p className="text-zinc-600 dark:text-zinc-400">
          Connecting to server...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      {/* Left Sidebar - Chats */}
      <span className={`flex w-full  transition-all duration-300 ${(showDeletePopup||showNewChatModal)?"opacity-50 blur-sm pointer-events-none":"opacity-100 blur-0 pointer-events-auto"}`}>
        <ChatSidebar />

        {/* Middle - Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!selectedChatId ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Select a chat to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <ChatHeader />

              {/* Messages & Input */}
              <ChatMessages />
            </>
          )}
        </main>
        {showChatInfoModal && <RightSide />}
      </span>

      {/* Right Sidebar - Profile */}
      {/* <SideProfile /> */}

      {/* Modals */}
      <DeletePopup />
      <NewChatModal />
      {/* <ChatInfoModal /> */}
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}
