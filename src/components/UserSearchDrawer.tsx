"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (user: User) => void;
}

const UserSearchDrawer: React.FC<UserSearchDrawerProps> = ({
  isOpen,
  onClose,
  onAddFriend,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const searchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/users?search=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: User[] = await res.json();
        setSearchResults(data);
      } else {
        console.error("Failed to search users:", await res.text());
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddFriend = async (user: User) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id || user._id }),
      });

      if (res.ok) {
        onAddFriend(user); // Aktualizacja listy znajomych
      } else {
        console.error("Failed to add friend:", await res.text());
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="fixed left-0 top-0 w-full md:h-full lg:w-[500px] h-full bg-white shadow-md">
        <DrawerHeader>
          <DrawerTitle>Find Users</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={searchUsers}>Search</Button>
          </div>
          <div className="flex flex-col gap-2">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id || user._id}
                  className="p-2 border rounded cursor-pointer flex justify-between items-center gap-2"
                >
                  <Avatar>
                    <AvatarImage
                      src={user.avatar || "/placeholder-avatar.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{user.name}</span>
                  <Button onClick={() => handleAddFriend(user)}>Add</Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No results found.</p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default UserSearchDrawer;
