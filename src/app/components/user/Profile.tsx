"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { userService } from "@/services/userService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Spinner from "@/app/components/ui/spinner";
import Image from "next/image";

export default function ProfileForm() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetUserInfo = async () => {
    try {
      const res = await userService.getProfile();
      setUserInfo(res.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setUserInfo((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (avatarFile) await userService.updateAvatar(avatarFile);

      await userService.updateProfile({
        firstName: userInfo.firstName,
        middleName: userInfo.middleName,
        lastName: userInfo.lastName,
        dob: userInfo.dob,
        gender: userInfo.gender,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      handleGetUserInfo();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setUserInfo((prev: any) => ({
        ...prev,
        avatarUrl: URL.createObjectURL(file),
      }));
    }
  };

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-60">
        <Spinner />
      </div>
    );

  if (!userInfo)
    return <p className="text-center text-gray-500">No data found</p>;

  return (
    <div className="flex justify-center">
      <div className="w-full bg-white rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Profile Information</h2>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className={`w-28 h-28 rounded-full border-2 border-gray-200 overflow-hidden relative cursor-pointer ${
              isEditing ? "hover:opacity-80" : ""
            }`}
            onClick={handleAvatarClick}
          >
            <Image
              width={20}
              height={20}
              src={`${userInfo.avatarUrl}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 text-white text-sm flex items-center justify-center">
                Change
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <Label>Email</Label>
          <Input value={userInfo.email} disabled />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={userInfo.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Middle Name</Label>
            <Input
              value={userInfo.middleName || ""}
              onChange={(e) => handleChange("middleName", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={userInfo.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* DOB + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={userInfo.dob ? userInfo.dob.split("T")[0] : ""}
              onChange={(e) => handleChange("dob", e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Gender</Label>
            <Select
              value={userInfo.gender ? "true" : "false"}
              onValueChange={(v: string) =>
                handleChange("gender", v === "true")
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Male</SelectItem>
                <SelectItem value="false">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
