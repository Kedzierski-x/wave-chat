"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CameraIcon } from "@heroicons/react/24/outline";
const ProfileDialog = ({ isOpen, onClose, user, onUpdateProfile, }) => {
    const [avatar, setAvatar] = useState(null);
    const [description, setDescription] = useState(user.description || "");
    const [previewAvatar, setPreviewAvatar] = useState(user.avatar);
    const handleAvatarChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAvatar(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };
    const handleSave = async () => {
        try {
            const formData = new FormData();
            if (avatar) {
                formData.append("avatar", avatar);
            }
            formData.append("description", description);
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token is missing.");
                return;
            }
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (!res.ok) {
                const errorResponse = await res.json();
                console.error("Failed to update profile:", errorResponse.error);
                return;
            }
            const updatedUser = await res.json();
            onUpdateProfile(updatedUser.avatar, updatedUser.description); // Zaktualizuj awatar
            setPreviewAvatar(updatedUser.avatar);
            onClose();
        }
        catch (error) {
            console.error("Error updating profile:", error);
        }
    };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Edytuj Profil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="w-24 h-24">
              <AvatarImage src={previewAvatar || "/placeholder-avatar.svg"} alt={user.name}/>
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <CameraIcon className="text-white w-6 h-6"/>
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
          </div>
          {/* Description */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Opis</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Dodaj swój opis..."/>
          </div>
          {/* Save Button */}
          <Button className="w-full mt-4" onClick={handleSave}>
            Zapisz Zmiany
          </Button>
        </div>
      </DialogContent>
    </Dialog>);
};
export default ProfileDialog;
