"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

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
import { useAuthStore } from "@/store/authStore";

type ProfileFormProps = {
  userInfo: any;
  isOwner: boolean;
  onUserInfoChange?: (user: any) => void;
};

export default function ProfileForm({
  userInfo,
  isOwner,
  onUserInfoChange,
}: ProfileFormProps) {
  const t = useTranslations("profile");

  const [formData, setFormData] = useState<any>(userInfo);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setUser } = useAuthStore();
  const canEdit = isOwner;

  useEffect(() => {
    setFormData(userInfo);
  }, [userInfo]);

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

      const res = await userService.updateProfile({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dob: dobValue,
        gender: formData.gender,
      });

      setUser(res.data);

      toast.success(t("toast.updateSuccess"));
      setIsEditing(false);
      onUserInfoChange?.(formData);
    } catch {
      toast.error(t("toast.updateError"));
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
    return <p className="text-center text-gray-500">{t("empty.noData")}</p>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full p-8 bg-white rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{t("title")}</h2>

          {canEdit &&
            (!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                {t("actions.edit")}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(userInfo);
                    setAvatarFile(null);
                  }}
                >
                  {t("actions.cancel")}
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? t("actions.saving") : t("actions.save")}
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
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white bg-black/40">
                {t("avatar.change")}
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
          <Label>{t("fields.email")}</Label>
          <Input value={formData.email} disabled />
        </div>

        {/* Name */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>{t("fields.firstName")}</Label>
            <Input
              value={formData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
              disabled={!canEdit || !isEditing}
            />
          </div>
          <div>
            <Label>{t("fields.middleName")}</Label>
            <Input
              value={formData.middleName || ""}
              onChange={(e) => handleChange("middleName", e.target.value)}
              disabled={!canEdit || !isEditing}
            />
          </div>
          <div>
            <Label>{t("fields.lastName")}</Label>
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
            <Label>{t("fields.dob")}</Label>
            <Input
              type="date"
              value={formData.dob ? String(formData.dob).split("T")[0] : ""}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => handleChange("dob", e.target.value)}
              disabled={!canEdit || !isEditing}
            />
          </div>

          <div>
            <Label>{t("fields.gender")}</Label>
            <Select
              value={
                formData.gender === true
                  ? "true"
                  : formData.gender === false
                  ? "false"
                  : ""
              }
              onValueChange={(v) => handleChange("gender", v === "true")}
              disabled={!canEdit || !isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("placeholders.gender")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{t("gender.male")}</SelectItem>
                <SelectItem value="false">{t("gender.female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
