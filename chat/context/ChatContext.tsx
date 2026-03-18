"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { getAuth } from "@/components/auth";
import {
  getSocket,
  initSocket,
  disconnectSocket,
} from "@/components/socket-client";
import { useRouter } from "next/navigation";

// Types
export interface IMessage {
  _id: string;
  sender: string;
  senderName?: string;
  content: string;
  chatId: string;
  timestamp: string;
  type?: "text" | "image" | "video" | "file";
  fileId?: string;
  userReaded?: string[];
  isStarred?: boolean;
}

export interface IChat {
  _id: string;
  participantIds: IUUser[];
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}
interface IUUser {
  _id: string;
  username: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
}
export interface ChatInfo extends IChat {
  displayName?: string;
  displayAvatar?: string;
  username?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  friends?: Friend[];
}

interface Friend {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface ChatContextType {
  // State
  user: User | null;
  chats: ChatInfo[];
  selectedChatId: string | null;
  messages: IMessage[];
  messageInput: string;
  loading: boolean;
  socketConnected: boolean;
  loadingMessages: boolean;
  error: string;
  showDeletePopup: boolean;
  onlineUsers: Map<string, { isOnline: boolean; lastSeen: string }>;

  // Modal states
  showNewChatModal: boolean;
  showChatInfoModal: boolean;
  isDropdownOpen: boolean;
  isProfileMenuOpen: boolean;

  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  // Actions
  setUser: (user: User | null) => void;
  setSelectedChatId: (id: string | null) => void;
  setMessageInput: (input: string) => void;
  setError: (error: string) => void;
  setShowNewChatModal: (show: boolean) => void;
  setShowChatInfoModal: (show: boolean) => void;
  setIsDropdownOpen: (open: boolean) => void;
  setIsProfileMenuOpen: (open: boolean) => void;
  setShowDeletePopup: (show: boolean) => void;

  // Functions
  fetchUserProfile: (token: string) => Promise<void>;
  fetchChats: (token: string) => Promise<void>;
  fetchMessages: (chatId: string, token: string) => Promise<void>;
  handleCreateChat: (recipientId: string) => Promise<void>;
  handleDeleteChat: (chatId: string) => Promise<void>;
  handleSendMessage: () => Promise<void>;
  handleFileUpload: (files: FileList) => Promise<void>;
  handleLogout: () => void;
  toggleStarMessage: (messageId: string, isStarred: boolean) => Promise<void>;
  starredMessages: Array<{ _id: string; starredAt: string }>;
  getTwoCharacterOfFAndLName: (name: string) => string;
  getLastSeenText: (lastSeen: string) => string;
  getUserStatus: (userId: string) => string;
  formatMessageTime: (timestamp: string | Date) => string;
  fetchFile: (fileId: string) => Promise<{ url: string; size: number }>;
  formatFileSize: (bytes: number) => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChatIdRef = useRef<string | null>(null);
  const messagesRef = useRef<IMessage[]>([]);

  // State
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [starredMessages, setStarredMessages] = useState<
    Array<{ _id: string; starredAt: string }>
  >([]); // derived list of IDs for quick lookup
  const starredMessageIds = starredMessages.map((m) => m._id);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChatInfoModal, setShowChatInfoModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<
    Map<string, { isOnline: boolean; lastSeen: string }>
  >(new Map());

  // Helper Functions
  const getTwoCharacterOfFAndLName = (name: string): string => {
    if (!name) return "U";
    const names = name.split(" ");
    const firstName = names[0] || "";
    const lastName = names.length > 1 ? names[names.length - 1] : "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getLastSeenText = (lastSeen: string): string => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  };

  const getUserStatus = (userId: string): string => {
    const status = onlineUsers.get(userId);
    if (!status) return "Offline";
    if (status?.isOnline) {
      return "Active now";
    }
    if (status?.lastSeen) {
      const lastSeenText = getLastSeenText(status.lastSeen);
      if (lastSeenText === "Invalid time") return "Offline";
      return `Last seen ${lastSeenText}`;
    }
    return "Offline";
  };

  const formatMessageTime = (timestamp: string | Date): string => {
    try {
      // Check if timestamp is undefined, null, or empty
      if (!timestamp) {
        return "Invalid time";
      }

      const date =
        typeof timestamp === "string" ? new Date(timestamp) : timestamp;

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid time";
      }

      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    } catch (err) {
      return "Invalid time";
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(`${baseUrl}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
    }
  };

  // Fetch chats list
  const fetchChats = async (token: string) => {
    try {
      const response = await axios.get(`${baseUrl}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUserId = user?._id;

      const formattedChats = response.data.map((chat: any) => {
        let displayName = "Unknown";
        let displayAvatar = "";
        let isOnline = false;
        let lastSeen = "";

        if (chat.participantIds && Array.isArray(chat.participantIds)) {
          // For 1-on-1 chats, get name from other participant
          const otherParticipant = chat.participantIds.find((p: any) => {
            const pId = typeof p === "string" ? p : p?._id;
            return pId !== currentUserId;
          });

          if (otherParticipant) {
            if (
              typeof otherParticipant === "object" &&
              otherParticipant.username
            ) {
              displayName = otherParticipant.username;
              displayAvatar = otherParticipant.avatar || "";
              isOnline = otherParticipant.isOnline || false;
              lastSeen = otherParticipant.lastSeen || "";

              // Update onlineUsers map with user data from backend
              if (otherParticipant._id) {
                setOnlineUsers((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(otherParticipant._id, {
                    isOnline: isOnline,
                    lastSeen: lastSeen || "",
                  });
                  return newMap;
                });
              }
            } else if (typeof otherParticipant === "string") {
              displayName = "User";
            } else {
              displayName = otherParticipant.username || "User";
              displayAvatar = otherParticipant.avatar || "";
              isOnline = otherParticipant.isOnline || false;
              lastSeen = otherParticipant.lastSeen || "";
            }
          }
        }

        return {
          ...chat,
          displayName,
          displayAvatar,
        };
      });

      setChats(formattedChats);
    } catch (err: any) {
      setError("Failed to load chats");
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: string, token: string) => {
    setLoadingMessages(true);
    try {
      // Fetch messages and starred messages in parallel
      const [messagesResponse, starredResponse] = await Promise.all([
        axios.get(`${baseUrl}/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .post(
            `${baseUrl}/users/message/starred`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .catch(() => ({ data: { starredMessages: [] } })), // Fallback if starred messages fail
      ]);

      const formattedMessages = messagesResponse.data.map((msg: any) => ({
        _id: msg._id,
        sender: msg.sender._id,
        senderName: msg.sender.username,
        content: msg.content,
        chatId: msg.chatId,
        timestamp: msg.createdAt,
        type: msg.type || "text",
        fileId: msg.fileId
          ? typeof msg.fileId === "string"
            ? msg.fileId
            : msg.fileId._id
          : undefined,
        userReaded: msg.userReaded || [],
      }));

      setMessages(formattedMessages);

      // Set starred message IDs
      const starredArr = (starredResponse.data?.starredMessages || []).map(
        (msg: any) => ({
          _id: msg._id,
          starredAt: msg.starredAt || new Date().toISOString(),
        }),
      );
      setStarredMessages(starredArr);
    } catch (err: any) {
      
      // If chat not found (404), remove it from the list
      if (err.response?.status === 404) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        setSelectedChatId(null);
        setMessages([]);
        setError("Chat was deleted");
      } else {
        setError("Failed to load messages");
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!selectedChatId) {
      setError("No chat selected");
      return;
    }

    try {
      const token = getAuth().getToken();

      // Convert FileList to array of file metadata with base64 data
      const fileMetadata: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        // Read file as base64
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64String = (reader.result as string).split(",")[1]; // Remove data:image/png;base64, prefix
            fileMetadata.push({
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64String,
            });
            resolve(null);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const response = await axios.post(
        `${baseUrl}/files/upload`,
        {
          chatId: selectedChatId,
          files: fileMetadata,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Send message with file - add to local state for sender
      const socket = getSocket();
      if (socket && user) {
        response.data.forEach((file: any) => {
          const fileType = file.mimetype.startsWith("image/")
            ? "image"
            : file.mimetype.startsWith("video/")
              ? "video"
              : "file";

          // Create local message for sender
          const newMessage: IMessage = {
            _id: file._id,
            sender: user._id,
            senderName: user.username,
            content: file.originalName || file.filename,
            chatId: selectedChatId,
            timestamp: new Date().toISOString(),
            type: fileType,
            fileId: file._id,
          };

          // Add message to local state for immediate display
          setMessages((prev) => [...prev, newMessage]);

          // Update chat's last message
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat._id === selectedChatId
                ? {
                    ...chat,
                    lastMessage: file.originalName || file.filename,
                    updatedAt: new Date().toISOString(),
                  }
                : chat,
            ),
          );

          // Emit via socket to other users
          socket.emit("message:send", {
            chatId: selectedChatId,
            content: file.originalName || file.filename,
            type: fileType,
            fileId: file._id,
          });
        });
      }
    } catch (err: any) {
      setError("Failed to upload file");
    }
  };

  // Create new 1-on-1 chat (or get existing one)
  const handleCreateChat = async (recipientId: string) => {
    try {
      const socket = getSocket();

      if (!socket || !socket.connected) {
        setError("Socket not connected");
        return;
      }

      // Check if chat already exists with this user
      const existingChat = chats.find(
        (c: ChatInfo) =>
          c.participantIds.some((p) => p._id === recipientId) &&
          c.participantIds.length === 2,
      );

      if (existingChat) {
        // Chat already exists, just select it
        setSelectedChatId(existingChat._id);
        setShowNewChatModal(false);
        return;
      }

      // Emit socket event to create chat
      socket.emit("chat:create", { recipientId }, (response: any) => {
        if (response && response.chatId) {
          setSelectedChatId(response.chatId);
          setShowNewChatModal(false);
          // Refresh chats
          const token = getAuth().getToken();
          if (token) {
            fetchChats(token);
          }
        }
      });
    } catch (err: any) {
      setError("Failed to create chat");
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId: string) => {
    try {
      const socket = getSocket();

      if (!socket || !socket.connected) {
        setError("Socket not connected");
        return;
      }
      // Emit socket event to delete chat
      socket.emit("chat:delete", { chatId });
      setChats((prev) => prev.filter((c) => c._id !== chatId));

      // if (selectedChatId === chatId) {
      // }

      setSelectedChatId(null);

      setShowChatInfoModal(false);
    } catch (err: any) {
      setError("Failed to delete chat");
    }
  };

  // Handle logout
  const handleLogout = () => {
    getAuth().clearToken();
    disconnectSocket();
    router.push("/auth/login");
  };

  // Toggle star message
  const toggleStarMessage = async (messageId: string, isStarred: boolean) => {
    try {
      const token = getAuth().getToken();
      if (!token) return;

      if (isStarred) {
        // Remove star
        await axios.put(
          `${baseUrl}/users/message/removeStar`,
          { messageId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setStarredMessages((prev) => prev.filter((m) => m._id !== messageId));
      } else {
        // Add star
        await axios.put(
          `${baseUrl}/users/message/star`,
          { messageId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setStarredMessages((prev) => [
          ...prev,
          { _id: messageId, starredAt: new Date().toISOString() },
        ]);
      }
    } catch (err: any) {
      setError("Failed to update starred message");
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId || !user) return;

    const content = messageInput;
    setMessageInput("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: IMessage = {
      _id: tempId,
      sender: user._id,
      senderName: user.username,
      content,
      chatId: selectedChatId,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === selectedChatId
          ? {
              ...chat,
              lastMessage: content,
              updatedAt: new Date().toISOString(),
            }
          : chat,
      ),
    );

    try {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        throw new Error("Socket not connected");
      }

      socket.emit(
        "message:send",
        { chatId: selectedChatId, content, type: "text" },
        (response: any) => {
          if (!response || !response.success || !response.message) {
            setMessages((prev) => prev.filter((m) => m._id !== tempId));
            setError("Failed to send message");
            return;
          }

          const saved = response.message as any;
          setMessages((prev) =>
            prev.map((m) =>
              m._id === tempId
                ? {
                    ...m,
                    _id: saved._id,
                    content: saved.content,
                    timestamp: saved.createdAt || saved.timestamp || m.timestamp,
                  }
                : m,
            ),
          );
        },
      );
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError("Failed to send message");
    }
  };

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keep refs in sync with state
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Initialize socket and fetch initial data
  useEffect(() => {
    const auth = getAuth();
    const token = auth.getToken();

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const initializeData = async () => {
      try {
        await fetchUserProfile(token);
        await fetchChats(token);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    initializeData();

    const socket = initSocket();

    const handleAuthSuccess = () => {
      setSocketConnected(true);
    };

    const handleAuthError = () => {
      auth.clearToken();
      router.push("/auth/login");
    };

    function handleNewMessage(message: IMessage) {
      if (message.chatId === selectedChatIdRef.current) {
        // Prevent duplicates by message id
        const messageExists = messagesRef.current.some(
          (m) => m._id === message._id,
        );
        if (!messageExists) {
          setMessages([...messagesRef.current, message]);
        }
      } else {
        messagesRef.current.push(message);
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === message.chatId
            ? {
                ...chat,
                lastMessage: message.content,
                updatedAt: new Date().toISOString(),
              }
            : chat,
        ),
      );
    }

    const handleChatCreated = async () => {
      // Refresh chats when new chat is created
      const token = getAuth().getToken();
      if (token) {
        await fetchChats(token);
      }
    };

    const handleChatDeleted = (data: any) => {
      const { chatId } = data;

      // Remove from local state
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      // Clear messages if deleted chat is the current one
      
      if (selectedChatIdRef.current == chatId) {
        setMessages([]);
        setSelectedChatId(null);
        setMessageInput("");
        setStarredMessages([]);
      } else {
        // Filter out messages from the deleted chat
        setMessages((prev) => prev.filter((m) => m.chatId !== chatId));
      }

      setShowChatInfoModal(false);
    };

    const handleUserOnline = (data: any) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          isOnline: true,
          lastSeen: data.lastSeen ,
        });
        return newMap;
      });
    };

    const handleUserOffline = (data: any) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          isOnline: false,
          lastSeen: data.lastSeen ,
        });
        return newMap;
      });
    };

    socket.on("auth:success", handleAuthSuccess);
    socket.on("auth:error", handleAuthError);
    socket.on("message:receive", handleNewMessage);
    socket.on("chat:created", handleChatCreated);
    socket.on("chat:deleted", handleChatDeleted);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("auth:success", handleAuthSuccess);
      socket.off("auth:error", handleAuthError);
      socket.off("message:receive", handleNewMessage);
      socket.off("chat:created", handleChatCreated);
      socket.off("chat:deleted", handleChatDeleted);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
    };
  }, [router]);

  // Load messages and join chat room when chat is selected
  useEffect(() => {
    let currentChatId = selectedChatId;

    if (selectedChatId) {
      const token = getAuth().getToken();
      if (token) {
        // Clear previous messages before loading new ones
        setMessages([]);
        setMessageInput("");

        fetchMessages(selectedChatId, token);

        // Join the chat room via Socket.IO
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit("chat:join", selectedChatId);
        }
      }
    } else {
      // Clear messages when no chat is selected
      setMessages([]);
      setMessageInput("");
      setStarredMessages([]);
    }

    return () => {
      // Leave the chat room when switching chats
      if (currentChatId) {
        const socket = getSocket();
        if (socket && socket.connected) {
          socket.emit("chat:leave", currentChatId);
        }
      }
    };
  }, [selectedChatId]);
  const fetchFile = async (
    fileId: string,
  ): Promise<{ url: string; size: number }> => {
    const token = getAuth().getToken();

    if (!token) {
      throw new Error("Not authenticated. Please log in again.");
    }

    const response = await fetch(`${baseUrl}/files/${fileId}/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorData.message || "Failed to fetch file"}`,
      );
    }

    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), size: blob.size };
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };
  const value: ChatContextType = {
    user,
    chats,
    selectedChatId,
    messages,
    messageInput,
    loading,
    socketConnected,
    loadingMessages,
    error,
    showNewChatModal,
    showChatInfoModal,
    isDropdownOpen,
    isProfileMenuOpen,
    showDeletePopup,
    onlineUsers,
    messagesEndRef,
    setUser,
    setSelectedChatId,
    setMessageInput,
    setError,
    setShowNewChatModal,
    setShowChatInfoModal,
    setIsDropdownOpen,
    setIsProfileMenuOpen,
    setShowDeletePopup,
    fetchUserProfile,
    fetchChats,
    fetchMessages,
    handleCreateChat,
    handleDeleteChat,
    handleSendMessage,
    handleFileUpload,
    handleLogout,
    toggleStarMessage,
    starredMessages,
    getTwoCharacterOfFAndLName,
    getLastSeenText,
    getUserStatus,
    formatMessageTime,
    fetchFile,
    formatFileSize,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
