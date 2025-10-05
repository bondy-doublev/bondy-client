"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import Spinner from "../ui/spinner";

export default function ChangePassword() {
  const t = useTranslations("user");
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    oldPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await authService.changePassword(
        oldPassword,
        newPassword,
        confirmPassword
      );
      toast.success(t("passwordChanged"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t("changePassword")}</h1>
      </div>

      <div className="space-y-1">
        <Label htmlFor="oldPassword">{t("oldPassword")}</Label>
        <div className="relative">
          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="oldPassword"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <div className="relative">
          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <p
          className={`text-red-600 text-sm italic mt-2 ${
            newPassword.length === 0 || newPassword.length >= 8 ? "hidden" : ""
          }`}
        >
          {t("note")} 
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <div className="relative">
          <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`pl-10 ${
              confirmPassword
                ? newPassword === confirmPassword
                  ? "border-green-500"
                  : "border-red-500"
                : ""
            }`}
          />
        </div>
      </div>

      <Button type="submit" className="w-full mt-4" disabled={!canSubmit}>
        {submitting ? <Spinner className="h-4 w-4" /> : t("update")}
      </Button>
    </form>
  );
}
