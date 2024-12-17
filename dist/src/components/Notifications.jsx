import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/hooks/use-toast"; // Jeśli używasz hooka do powiadomień
const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const toggleNotifications = () => setIsOpen((prev) => !prev);
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast({
                        title: "Error",
                        description: "You need to log in to see notifications.",
                        variant: "destructive",
                    });
                    return;
                }
                const res = await fetch("/api/unread-messages", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    toast({
                        title: "Error",
                        description: (errorData === null || errorData === void 0 ? void 0 : errorData.error) || "Failed to fetch notifications.",
                        variant: "destructive",
                    });
                    return;
                }
                const data = await res.json();
                console.log("Fetched unread messages:", data); // Debug log
                setNotifications(data);
            }
            catch (error) {
                console.error("Error fetching notifications:", error);
                toast({
                    title: "Error",
                    description: "Failed to load notifications. Try again later.",
                    variant: "destructive",
                });
            }
        };
        fetchUnreadMessages();
    }, [toast]);
    return (<div className="relative">
      <button className="relative focus:outline-none" onClick={toggleNotifications}>
        <BellIcon className="h-6 w-6 text-gray-500"/>
        {notifications.length > 0 && (<span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notifications.length}
          </span>)}
      </button>
      {isOpen && notifications.length > 0 && (<div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg">
          <ul>
            {notifications.map((notification) => (<li key={notification.id} className="border-b p-2 text-sm flex items-center hover:bg-gray-100">
                <img src={notification.sender.avatar || "/placeholder-avatar.svg"} alt={notification.sender.name} className="w-6 h-6 rounded-full mr-2"/>
                <span>{notification.content}</span>
              </li>))}
          </ul>
        </div>)}
    </div>);
};
export default Notifications;
