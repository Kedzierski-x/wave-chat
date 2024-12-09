"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  description?: string;
}

interface SidebarProps {
  friends: User[];
  onFindUsers: () => void;
  onSelectUser: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  friends,
  onFindUsers,
  onSelectUser,
}) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Friends</h2>
      <button
        className="w-full p-2 mb-4 bg-blue-500 text-white rounded"
        onClick={onFindUsers}
      >
        Find Users
      </button>
      <div>
        {friends.length > 0 ? (
          friends.map((friend) => {
            console.log("Rendering friend:", friend); // Debug: sprawdź każdego znajomego

            return (
              <div
                key={friend.id || friend._id} // Użyj `_id` jako fallback
                className="p-2 border-b cursor-pointer flex items-center gap-3 hover:bg-gray-100 rounded"
                onClick={() => onSelectUser(friend)}
              >
                <Avatar>
                  <AvatarImage
                    src={friend.avatar || "/placeholder-avatar.svg"}
                    alt={friend.name}
                  />
                  <AvatarFallback>{friend.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{friend.name}</span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No friends found.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
