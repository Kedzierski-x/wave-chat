"use client";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
const UserAvatar = ({ user, size = "w-10 h-10", className, }) => {
    return (<Avatar className={`${size} ${className}`}>
      <AvatarImage src={user.avatar || "/placeholder-avatar.svg"} alt={user.name}/>
      <AvatarFallback>{user.name[0]}</AvatarFallback>
    </Avatar>);
};
export default UserAvatar;
