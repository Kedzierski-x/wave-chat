"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import UserSearchDrawer from "@/components/UserSearchDrawer";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import Notifications from "@/components/Notifications";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
}

interface Message {
  id: string;
  sender: User;
  content: string;
  createdAt: string;
}

const Chat = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 p-4 shadow-sm">
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
        <Notifications />
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-1/4 border-r bg-white">
          <Sidebar
            friends={friends}
            onFindUsers={() => setIsDrawerOpen(true)}
            onSelectUser={(friend) => setSelectedFriend(friend)}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedFriend ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-blue-600">
                  Chat with {selectedFriend.name}
                </h2>
              </div>

              {/* Scrollable messages area */}
              <ScrollArea
                className="flex-1 p-4"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <div className="space-y-2">
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
                            <img
                              src={
                                message.sender.avatar ||
                                "/placeholder-avatar.svg"
                              }
                              alt={message.sender.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          )}

                          {/* Wiadomość */}
                          <div
                            className={`p-3 rounded-lg max-w-xs ${
                              isCurrentUser
                                ? "bg-blue-500 text-white text-right"
                                : "bg-gray-200 text-black text-left"
                            }`}
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
              <div className="sticky bottom-0 p-4 bg-white border-t flex gap-2">
                <input
                  className="flex-1 border p-2 rounded"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 p-4">
              Select a friend to start chatting
            </p>
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
