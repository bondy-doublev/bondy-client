"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { extractErrorMessage } from "@/utils/format";
import {
  Eye,
  EyeOff,
  Home,
  KeyRound,
  Mail,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function ForgotPassword() {
  const t = useTranslations("auth");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isPasswordValid = newPass.length >= 8;
  const isConfirmValid = confirmPass === newPass && confirmPass.length > 0;

  async function handleSendOtp() {
    if (!isEmailValid) {
      toast.error(t("invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      await authService.sendResetPasswordOtp(email);
      toast.success(t("otpSent"));
      setStep(2);
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 6) {
      toast.error(t("otpLength"));
      return;
    }
    setStep(3);
  }

  async function handleResetPassword() {
    if (newPass.length < 8) {
      toast.error(t("passwordMin"));
      return;
    }
    if (newPass !== confirmPass) {
      toast.error(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, newPass, confirmPass, otp);
      toast.success(t("passwordResetSuccess"));
      window.location.href = "/signin";
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = {
    1: t("forgotPassword"),
    2: t("verifyOtp"),
    3: t("resetPassword"),
  };

  const stepDescriptions = {
    1: t("forgotPasswordDesc"),
    2: t("otpDesc"),
    3: t("resetPasswordDesc"),
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Side - Info Card */}
          <div className="flex-col justify-center hidden p-8 space-y-6 shadow-xl md:flex bg-white/80 backdrop-blur-sm rounded-2xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center bg-green-500 rounded-full w-14 h-14">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {t("resetPasswordTitle")}
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                {t("resetPasswordSubtitle")}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              <div
                className={`flex items-start gap-3 ${
                  step >= 1 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    step > 1
                      ? "bg-green-500"
                      : step === 1
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {step > 1 ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Mail
                      className={`w-6 h-6 ${
                        step === 1 ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("step1Title")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("step1Desc")}</p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 ${
                  step >= 2 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    step > 2
                      ? "bg-green-500"
                      : step === 2
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {step > 2 ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Shield
                      className={`w-6 h-6 ${
                        step === 2 ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("step2Title")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("step2Desc")}</p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 ${
                  step >= 3 ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    step === 3 ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Lock
                    className={`w-6 h-6 ${
                      step === 3 ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("step3Title")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("step3Desc")}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t("rememberPassword")}{" "}
                <Link href="/signin" className="font-semibold text-green-600">
                  {t("signIn")}
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <Card className="border-2 border-gray-100 shadow-2xl">
            <CardHeader className="pb-4 space-y-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 mb-2 text-sm text-gray-500 hover:text-gray-700 w-fit"
              >
                <Home size={16} /> {t("backHome")}
              </Link>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {stepTitles[step]}
              </CardTitle>
              <p className="text-sm text-center text-gray-500">
                {stepDescriptions[step]}
              </p>

              {/* Progress Bar */}
              <div className="flex gap-2 pt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      s <= step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {/* Step 1: Email Input */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t("email")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`mt-1.5 ${
                        email
                          ? isEmailValid
                            ? "border-green-500"
                            : "border-red-500"
                          : ""
                      }`}
                    />
                    {email && !isEmailValid && (
                      <p className="mt-1 text-xs text-red-500">
                        {t("invalidEmail")}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    disabled={!isEmailValid || loading}
                    className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                        {t("sending")}
                      </span>
                    ) : (
                      <div>{t("sendOtp")}</div>
                    )}
                  </Button>
                </div>
              )}

              {/* Step 2: OTP Input */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Check your email
                        </p>
                        <p className="mt-1 text-sm text-blue-700">
                          We sent a 6-digit code to{" "}
                          <span className="font-semibold">{email}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="otp"
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t("otp")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength={6}
                      className="mt-1.5 text-center text-2xl tracking-widest font-bold"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("back")}
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6 || loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {t("continue")}
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {t("resendQuestion")}{" "}
                    <span className="font-semibold text-green-600">
                      {t("resend")}
                    </span>
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="newPass"
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t("newPassword")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="newPass"
                        type={showPass ? "text" : "password"}
                        placeholder={t("newPasswordPlaceholder")}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className={`pr-10 ${
                          newPass
                            ? isPasswordValid
                              ? "border-green-500"
                              : "border-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {newPass && !isPasswordValid && (
                      <p className="mt-1 text-xs text-red-500">
                        {t("passwordMin")}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPass"
                      className="text-sm font-semibold text-gray-700"
                    >
                      {t("confirmPassword")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPass"
                        type={showConfirmPass ? "text" : "password"}
                        placeholder={t("confirmPasswordPlaceholder")}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className={`pr-10 ${
                          confirmPass
                            ? isConfirmValid
                              ? "border-green-500"
                              : "border-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPass ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {confirmPass && !isConfirmValid && (
                      <p className="mt-1 text-xs text-red-500">
                        {t("passwordMismatch")}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t("back")}
                    </Button>
                    <Button
                      onClick={handleResetPassword}
                      disabled={!isPasswordValid || !isConfirmValid || loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                          {t("processing")}
                        </span>
                      ) : (
                        <div>{t("resetPassword")}</div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
