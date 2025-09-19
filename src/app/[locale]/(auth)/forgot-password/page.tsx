"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { Card, Label, TextInput, Button, Spinner } from "flowbite-react";
import { EnvelopeIcon, KeyIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetPasswordToken, setResetPasswordToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Step 1: Submit email
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.requestResetPassword(email);
      toast.success(t("resetLinkSent"));
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: Verify OTP
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authService.verifyOtp(email, otp);
      if (res.valid) {
        setResetPasswordToken(res.resetPasswordToken);
        toast.success(t("otpValid"));
        setStep("reset");
      } else {
        toast.error(t("otpInvalid"));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  // Step 3: Reset password
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const canSubmit =
    newPassword.length >= 6 &&
    hasUpperCase &&
    hasSpecialChar &&
    newPassword === confirmPassword &&
    !submitting;

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await authService.resetPassword(resetPasswordToken, newPassword);
      toast.success(t("passwordResetSuccess"));
      router.push("/signin");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="mb-6 flex justify-between items-center">
          {["email", "otp", "reset"].map((s) => {
            const isActive = step === s;
            let color = "bg-gray-300";
            if (s === "email" && isActive) color = "bg-blue-500";
            if (s === "otp" && isActive) color = "bg-green-500";
            if (s === "reset" && isActive) color = "bg-purple-500";

            return (
              <div key={s} className="flex-1 h-2 mx-1 rounded">
                <div className={`${color} h-2 rounded transition-all duration-300`} />
              </div>
            );
          })}
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("forgotPassword")}</h1>
              <p className="text-sm text-gray-600 mt-1">{t("forgotPasswordDesc")}</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={EnvelopeIcon}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button color="blue" type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> {t("sending")}
                  </span>
                ) : (
                  t("sendResetLink")
                )}
              </Button>
            </form>
          </>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("verifyOtp")}</h1>
              <p className="text-sm text-gray-600 mt-1">{t("otpDesc")}</p>
            </div>
            <form onSubmit={handleOtpSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="otp">{t("otp")}</Label>
                <TextInput
                  id="otp"
                  type="text"
                  placeholder="123456"
                  icon={KeyIcon}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button color="green" type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Spinner size="sm" /> : t("verify")}
              </Button>
            </form>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{t("resetPassword")}</h1>
              <p className="text-sm text-gray-600 mt-1">{t("resetPasswordDesc")}</p>
            </div>
            <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <TextInput
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={LockClosedIcon}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className={`text-red-600 text-sm italic mt-2 ${
                  hasUpperCase && hasSpecialChar && newPassword.length >= 6 ? "hidden" : ""
                }`}>
                  {t("note")}
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <TextInput
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={LockClosedIcon}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  color={
                    confirmPassword
                      ? newPassword === confirmPassword
                        ? "success"
                        : "failure"
                      : undefined
                  }
                />
              </div>

              <Button color="blue" type="submit" className="w-full" disabled={!canSubmit}>
                {submitting ? <Spinner size="sm" /> : t("reset")}
              </Button>
            </form>
          </>
        )}

      </Card>
    </main>
  );
}
