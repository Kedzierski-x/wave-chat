"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import UserSearchDrawer from "@/components/UserSearchDrawer";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import Notifications from "@/components/Notifications";
import { useToast } from "@/hooks/use-toast";

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const Chat = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  // Fetch current user and friends on mount
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

        const userData = await res.json();
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

        const data = await res.json();
        setFriends(Array.isArray(data) ? data : []);
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
  }, []);

  // Fetch messages when a friend is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedFriend || !(selectedFriend.id || selectedFriend._id)) {
        console.error("Selected friend is invalid.");
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
        const friendId = selectedFriend.id || selectedFriend._id; // Ensure correct friendId
        const res = await fetch(`/api/messages?friendId=${friendId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          toast({
            title: "Error fetching messages",
            description: "Failed to load messages.",
            variant: "destructive",
          });
          return;
        }

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedFriend]);

  // Send message
  const sendMessage = async () => {
    if (
      !newMessage.trim() ||
      !selectedFriend ||
      !(selectedFriend.id || selectedFriend._id)
    ) {
      toast({
        title: "Error",
        description: "Friend or message content is missing.",
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
      const friendId = selectedFriend.id || selectedFriend._id; // Ensure correct friendId
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendId,
          message: newMessage,
        }),
      });

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        });
        return;
      }

      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage(""); // Clear input field
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-gray-100 p-4 shadow-sm">
        {currentUser && (
          <UserAvatarMenu
            user={currentUser!}
            onLogout={handleLogout}
            onUpdateUser={(updatedData) =>
              setCurrentUser((prev) =>
                prev
                  ? { ...prev, ...updatedData }
                  : { ...updatedData, name: "", email: "" }
              )
            }
          />
        )}
        <Notifications />
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/4 border-r">
          <Sidebar
            friends={friends}
            onFindUsers={() => setIsDrawerOpen(true)}
            onSelectUser={(friend) => setSelectedFriend(friend)}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 flex flex-col">
          {selectedFriend ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4">
                  Chat with {selectedFriend.name}
                </h2>
                {messages.map((message) => (
                  <div key={message.id} className="mb-2">
                    <strong>
                      {message.sender === currentUser?.id
                        ? "You"
                        : selectedFriend.name}
                      :
                    </strong>{" "}
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  className="flex-1 border p-2 rounded"
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a friend to start chatting</p>
          )}
        </div>
      </div>

      {/* User Search Drawer */}
      <UserSearchDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddFriend={(friend) => setFriends((prev) => [...prev, friend])}
      />
    </div>
  );
};

export default Chat;
