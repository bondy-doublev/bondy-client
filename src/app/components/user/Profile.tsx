"use client";

import { useEffect, useRef, useState } from "react";
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

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";

type ProfileFormProps = {
  userInfo: any;
  isOwner: boolean;
  // cho phép parent cập nhật lại state bên ngoài sau khi save (optional)
  onUserInfoChange?: (user: any) => void;
};

export default function ProfileForm({
  userInfo,
  isOwner,
  onUserInfoChange,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<any>(userInfo);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = isOwner;

  // sync lại khi props.userInfo thay đổi (VD: khi reload từ parent)
  useEffect(() => {
    setFormData(userInfo);
  }, [userInfo]);

  // Nếu không phải chính chủ thì chắc chắn không được edit
  useEffect(() => {
    if (!canEdit && isEditing) {
      setIsEditing(false);
    }
  }, [canEdit, isEditing]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!canEdit) return;

    try {
      setSaving(true);

      if (avatarFile) {
        await userService.updateAvatar(avatarFile);
      }

      const dobValue =
        typeof formData.dob === "string"
          ? formData.dob.split("T")[0]
          : formData.dob;

      await userService.updateProfile({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dob: dobValue, // 👈 FIX
        gender: formData.gender,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      // cập nhật lại ra parent nếu cần
      onUserInfoChange?.(formData);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (canEdit && isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit || !isEditing) return;

    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setFormData((prev: any) => ({
        ...prev,
        avatarUrl: URL.createObjectURL(file),
      }));
    }
  };

  if (!formData) {
    return <p className="text-center text-gray-500">No data found</p>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full bg-white rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Profile Information</h2>

          {canEdit &&
            (!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(userInfo); // revert về data cũ
                    setAvatarFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            ))}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div
            className={`w-28 h-28 rounded-full border-2 border-gray-200 overflow-hidden relative ${
              canEdit ? "cursor-pointer" : "cursor-default"
            } ${canEdit && isEditing ? "hover:opacity-80" : ""}`}
            onClick={handleAvatarClick}
          >
            {formData.avatarUrl ? (
              <UserAvatar
                className="w-full h-full pointer-events-none"
                userId={formData.id}
                avatarUrl={formData.avatarUrl}
              />
            ) : (
              <DefaultAvatar
                className="w-full h-full"
                firstName={formData.firstName}
              />
            )}

            {canEdit && isEditing && (
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
          <Input value={formData.email} disabled />
        </div>

        {/* Name row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={formData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              disabled={!canEdit || !isEditing}
            />
          </div>
          <div>
            <Label>Middle Name</Label>
            <Input
              value={formData.middleName || ""}
              onChange={(e) => handleChange("middleName", e.target.value)}
              disabled={!canEdit || !isEditing}
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={formData.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
              disabled={!canEdit || !isEditing}
            />
          </div>
        </div>

        {/* DOB + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.dob ? String(formData.dob).split("T")[0] : ""}
              max={new Date().toISOString().split("T")[0]} // 🚫 không chọn được ngày mai
              onChange={(e) => handleChange("dob", e.target.value)}
              disabled={!canEdit || !isEditing}
            />

          </div>

          <div>
            <Label>Gender</Label>
            <Select
              value={
                formData.gender === true
                  ? "true"
                  : formData.gender === false
                  ? "false"
                  : ""
              }
              onValueChange={(v: string) =>
                handleChange("gender", v === "true")
              }
              disabled={!canEdit || !isEditing}
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
