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

export default function ForgotPassword() {
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
      toast.error("Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      await authService.sendResetPasswordOtp(email);
      toast.success("Đã gửi mã OTP, vui lòng kiểm tra email");
      setStep(2);
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 6) {
      toast.error("Mã OTP phải có 6 ký tự");
      return;
    }
    setStep(3);
  }

  async function handleResetPassword() {
    if (newPass.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, newPass, confirmPass, otp);
      toast.success("Đổi mật khẩu thành công!");
      window.location.href = "/signin";
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = {
    1: "Quên mật khẩu",
    2: "Xác minh OTP",
    3: "Đặt lại mật khẩu",
  };

  const stepDescriptions = {
    1: "Nhập email để nhận mã xác minh",
    2: "Nhập mã OTP đã được gửi đến email của bạn",
    3: "Tạo mật khẩu mới cho tài khoản của bạn",
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Info Card */}
          <div className="hidden md:flex flex-col justify-center space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Reset Password
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Don't worry! It happens. Follow these steps to reset your
                password.
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
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Step 1: Email Verification
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter your email to receive a verification code
                  </p>
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
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Step 2: Enter OTP Code
                  </h3>
                  <p className="text-sm text-gray-600">
                    Verify the 6-digit code sent to your email
                  </p>
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
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Step 3: Create New Password
                  </h3>
                  <p className="text-sm text-gray-600">
                    Set a strong password for your account
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Remember your password?{" "}
                <Link
                  href="/signin"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <Card className="shadow-2xl border-2 border-gray-100">
            <CardHeader className="space-y-1 pb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2 w-fit"
              >
                <Home size={16} /> Back to Home
              </Link>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">
                {stepTitles[step]}
              </CardTitle>
              <p className="text-center text-sm text-gray-500">
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
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
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
                      <p className="text-xs text-red-500 mt-1">
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    disabled={!isEmailValid || loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send OTP Code"
                    )}
                  </Button>
                </div>
              )}

              {/* Step 2: OTP Input */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Check your email
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
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
                      Enter 6-digit Code <span className="text-red-500">*</span>
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
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6 || loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Continue
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
                  >
                    Didn't receive code?{" "}
                    <span className="text-green-600 font-semibold">Resend</span>
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
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="newPass"
                        type={showPass ? "text" : "password"}
                        placeholder="Enter new password"
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {newPass && !isPasswordValid && (
                      <p className="text-xs text-red-500 mt-1">
                        Password must be at least 8 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPass"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPass"
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Confirm new password"
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPass ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {confirmPass && !isConfirmValid && (
                      <p className="text-xs text-red-500 mt-1">
                        Passwords do not match
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
                      Back
                    </Button>
                    <Button
                      onClick={handleResetPassword}
                      disabled={!isPasswordValid || !isConfirmValid || loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Reset Password"
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
