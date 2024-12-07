"use client";

import { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";

const Notifications = () => {
  const [notifications, setNotifications] = useState<string[]>([
    "New message from John",
    "New message from Alice",
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative">
      <button
        className="relative focus:outline-none"
        onClick={toggleNotifications}
      >
        <BellIcon className="h-6 w-6 text-gray-500" />
        {notifications.length > 0 && (
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg">
          <ul>
            {notifications.map((notification, index) => (
              <li
                key={index}
                className="border-b p-2 text-sm hover:bg-gray-100"
              >
                {notification}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
