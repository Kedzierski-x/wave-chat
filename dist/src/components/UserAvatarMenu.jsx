"use client";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { ArrowLeftEndOnRectangleIcon, UserCircleIcon, } from "@heroicons/react/24/outline";
import ProfileDialog from "./ProfileDialog";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
const UserAvatarMenu = ({ user, onLogout, onUpdateUser, }) => {
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const { toast } = useToast();
    const handleUpdateProfile = async (avatar, description) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                title: "Error",
                description: "User not authenticated.",
                variant: "destructive",
            });
            return;
        }
        const formData = new FormData();
        formData.append("description", description);
        if (avatar)
            formData.append("avatar", avatar);
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (!res.ok) {
                const errorResponse = await res.json();
                toast({
                    title: "Error",
                    description: errorResponse.error || "Failed to update profile.",
                    variant: "destructive",
                });
                return;
            }
            const { user: updatedUser } = await res.json();
            onUpdateUser({
                avatar: updatedUser.avatar,
                description: updatedUser.description,
            });
            toast({
                title: "Profile Updated",
                description: "Your profile was successfully updated.",
            });
        }
        catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
    };
    return (<>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full focus:outline-none">
            <UserAvatar user={{ name: user.name, avatar: user.avatar }} size="w-10 h-10"/>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold">{user.name}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="ml-1 px-4 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <DropdownMenuSeparator className="my-1"/>
          <DropdownMenuItem className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => setIsProfileDialogOpen(true)}>
            <UserCircleIcon className="mr-1 !h-6 !w-6"/>
            <span>Mój profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
            <ArrowLeftEndOnRectangleIcon className="mr-1 !h-6 !w-6"/>
            <span>Wyloguj</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog isOpen={isProfileDialogOpen} onClose={() => setIsProfileDialogOpen(false)} user={user} onUpdateProfile={handleUpdateProfile}/>
    </>);
};
export default UserAvatarMenu;
