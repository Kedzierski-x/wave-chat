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
    <div className="p-4 bg-gray-900 text-gray-100 h-full">
      <h2 className="text-lg font-bold mb-4 text-gray-200">Friends</h2>
      <button
        className="w-full p-2 mb-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded hover:from-gray-600 hover:to-gray-500 font-semibold"
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
                key={friend.id}
                className="p-2 border-b border-gray-700 cursor-pointer flex items-center gap-3 hover:bg-gray-800 rounded"
                onClick={() => onSelectUser(friend)}
              >
                <Avatar>
                  <AvatarImage
                    src={friend.avatar || "/placeholder-avatar.svg"}
                    alt={friend.name}
                  />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {friend.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-md font-medium text-gray-300">
                  {friend.name}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No friends found.</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
