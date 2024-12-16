"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Sidebar from "@/components/Sidebar";
import UserSearchDrawer from "@/components/UserSearchDrawer";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import Notifications from "@/components/Notifications";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const socket = io("http://localhost:4000"); // Adres serwera Socket.IO

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  createdAt: string;
  read: boolean;
}

const Chat = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Connect to Socket.IO and join the user's room
    socket.on("connect", () => {
      console.log("Connected to Socket.IO:", socket.id);

      if (currentUser) {
        socket.emit("join", currentUser.id);
      }
    });

    // Listen for real-time incoming messages
    socket.on("message", (message: Message) => {
      if (selectedFriend?.id === message.sender.id) {
        setMessages((prev) => [...prev, message]);
      } else {
        toast({
          title: `New message from ${message.sender.name}`,
          description: message.content,
        });
      }
    });

    // Cleanup Socket.IO listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, [currentUser, selectedFriend, toast]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in to access your account.",
          variant: "destructive",
        });
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          toast({
            title: "Error fetching user data",
            description: errorResponse.error || "Failed to fetch user data.",
            variant: "destructive",
          });
          return;
        }

        const userData: User = await res.json();
        setCurrentUser(userData);
        socket.emit("join", userData.id);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      }
    };

    const fetchFriends = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          toast({
            title: "Error fetching friends",
            description: errorResponse.error || "Failed to fetch friends.",
            variant: "destructive",
          });
          return;
        }

        const data: User[] = await res.json();
        setFriends(
          data.map((friend: any) => ({
            ...friend,
            id: friend.id || friend._id,
          }))
        );
      } catch (error) {
        console.error("Error fetching friends:", error);
        toast({
          title: "Error",
          description: "Failed to fetch friends. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchCurrentUser();
    fetchFriends();
  }, [toast]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend?.id) return;

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing.",
          variant: "destructive",
        });
        return;
      }

      try {
        const res = await fetch(`/api/messages?friendId=${selectedFriend.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          toast({
            title: "Error fetching messages",
            description: errorResponse.error || "Failed to load messages.",
            variant: "destructive",
          });
          return;
        }

        const data: Message[] = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedFriend, toast]);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Error",
        description: "Message content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFriend?.id) {
      toast({
        title: "Error",
        description: "Recipient is not selected.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendId: selectedFriend.id,
          message: newMessage,
        }),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        toast({
          title: "Error sending message",
          description: errorResponse.error || "Failed to send message.",
          variant: "destructive",
        });
        return;
      }

      const savedMessage: Message = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Dodaj logikę, która oznacza wiadomości jako przeczytane:
  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const res = await fetch("/api/messages/read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageIds }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to mark messages as read:", errorData);
        return;
      }

      console.log("Messages marked as read successfully.");
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  // Przykład wywołania tej funkcji w momencie otwierania czatu:
  useEffect(() => {
    if (selectedFriend && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(
          (msg) => !msg.read && msg.sender.id !== currentUser?.id // Tylko nieprzeczytane
        )
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    }
  }, [selectedFriend, messages, currentUser]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 p-4 shadow-sm">
        {/* Burger Menu*/}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="p-2 bg-opacity-100 text-white"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        {currentUser && (
          <UserAvatarMenu
            user={currentUser}
            onLogout={handleLogout}
            onUpdateUser={(updatedData: Partial<User>) =>
              setCurrentUser((prev) =>
                prev ? { ...prev, ...updatedData } : null
              )
            }
          />
        )}
        <img
          src="/logo.svg" // Path to your logo file
          alt="Logo"
          className="w-10"
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static top-0 left-0 ${
            isSidebarOpen ? "w-full" : "w-3/4"
          } md:w-1/4 h-full bg-gray-850 z-50 border-r transition-transform duration-300 ease-in-out`}
        >
          <Sidebar
            friends={friends}
            onFindUsers={() => setIsDrawerOpen(true)}
            onSelectUser={(friend) => {
              setSelectedFriend(friend);
              setIsSidebarOpen(false); // Close Sidebar on small screens after selecting a user
            }}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {selectedFriend ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b ">
                <h2 className="text-lg font-bold ">
                  Chat with {selectedFriend.name}
                </h2>
              </div>

              {/* Scrollable messages area */}
              <ScrollArea
                className="bg-gradient-to-r from-gray-900 via-gray-900 to-dark-purple flex-1 pl-6 pr-6"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <div className="space-y-2 pb-5 pt-5">
                  {messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isCurrentUser =
                        currentUser?.id === message.sender.id;

                      // Debugowanie identyfikatorów użytkownika
                      console.log("Message sender ID:", message.sender.id);
                      console.log("Current user ID:", currentUser?.id);
                      console.log("Is current user:", isCurrentUser);

                      // Sprawdzamy, czy to ostatnia wiadomość od znajomego
                      const isLastFromFriend =
                        !isCurrentUser &&
                        (index === messages.length - 1 ||
                          messages[index + 1]?.sender.id !== message.sender.id);

                      return (
                        <div
                          key={message.id}
                          className={`flex items-end ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* Avatar znajomego tylko przy ostatniej wiadomości */}
                          {!isCurrentUser && isLastFromFriend && (
                            <div className="w-10">
                              <img
                                src={
                                  message.sender.avatar ||
                                  "/placeholder-avatar.svg"
                                }
                                alt={message.sender.name}
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            </div>
                          )}

                          {/* Wiadomość */}
                          <div
                            className={`p-3 rounded-lg max-w-xs ${
                              isCurrentUser
                                ? "bg-purple-700  text-white"
                                : "bg-gray-800 text-gray-200"
                            } ${!isCurrentUser && "ml-12"}`}
                            style={{
                              marginLeft:
                                !isCurrentUser && !isLastFromFriend
                                  ? "2.49rem"
                                  : "0",
                            }}
                          >
                            {message.content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No messages found.</p>
                  )}
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className=" border-t sticky bottom-0 p-2 bg-gray-900  flex gap-2 pl-4 pr-4">
                <input
                  className="flex-1 border border-gray-600 p-2 rounded bg-gray-700 text-gray-200 placeholder-gray-400"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="bg-purple-700 text-white px-4 py-2 rounded hover:opacity-90"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-3xl font-bold opacity-70">
                Wybierz znajomego, aby rozpocząć czat
              </p>
              <img
                src="/logo.svg" // Path to your logo file
                alt="Logo"
                className="w-96 h-96 opacity-30"
              />
            </div>
          )}
        </div>
      </div>

      {/* User search drawer */}
      <UserSearchDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddFriend={(friend) => setFriends((prev) => [...prev, friend])}
      />
    </div>
  );
};

export default Chat;
