import { useChat } from "@/context/ChatContext";
import React from "react";

type Props = {};

function DeletePopup({}: Props) {
  const {
    selectedChatId,
    showDeletePopup,
    setShowDeletePopup,
    handleDeleteChat,
  } = useChat();

  const handleConfirmDelete = async () => {
    if (selectedChatId) {
      await handleDeleteChat(selectedChatId);
      setShowDeletePopup(false);
    }
  };

  const handleCancel = () => {
    setShowDeletePopup(false);
  };

  if (!showDeletePopup) {
    return null;
  }

  return (
    <div style={{translate:"50% -40%"}} className="absolute top-[50%] right-[50%]  bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
          Delete Chat
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Are you sure you want to delete this chat?<br/> This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white font-semibold py-2 px-6 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeletePopup;
