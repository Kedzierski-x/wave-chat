import { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface CustomNotification {
  id: string;
  content: string;
  sender: { name: string; avatar?: string };
}

const Notifications = ({
  newNotification,
  onNotificationClear,
}: {
  newNotification: CustomNotification | null;
  onNotificationClear: () => void; // Funkcja do czyszczenia powiadomień
}) => {
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const toggleNotifications = () => {
    if (isOpen) {
      setNotifications([]); // Wyczyść powiadomienia po zamknięciu
      onNotificationClear(); // Wywołaj przekazaną funkcję do czyszczenia
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (newNotification) {
      const uniqueId = `${newNotification.id}-${Date.now()}`;
      const notificationWithUniqueId = { ...newNotification, uniqueId };

      setNotifications((prev) =>
        [notificationWithUniqueId, ...prev].slice(0, 10)
      );
    }
  }, [newNotification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setNotifications([]); // Wyczyść powiadomienia po zamknięciu
          onNotificationClear(); // Wywołaj przekazaną funkcję do czyszczenia
        }
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onNotificationClear]);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="relative focus:outline-none"
        onClick={toggleNotifications}
      >
        <BellIcon className="h-6 w-6 text-gray-500" />
        {notifications.length > 0 && (
          <span className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && notifications.length > 0 && (
        <Card className="absolute right-0 mt-2 w-80 shadow-lg z-10">
          <CardHeader>
            <CardTitle>Powiadomienia</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {notifications.map((notification, index) => (
                <li
                  key={notification.id || `${notification.id}-${index}`}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  onClick={() => {
                    onNotificationClear(); // Przekazujemy, że powiadomienie zostało obsłużone
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        notification.sender.avatar || "/placeholder-avatar.svg"
                      }
                      alt={notification.sender.name}
                    />
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {notification.sender.name}
                    </span>
                    <span className="text-sm text-gray-600 truncate">
                      {notification.content}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
