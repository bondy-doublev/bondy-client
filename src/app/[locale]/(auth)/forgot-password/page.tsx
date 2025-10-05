"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import Spinner from "@/app/components/ui/spinner";
import { extractErrorMessage } from "@/utils/format";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
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
    if (otp.length < 4) {
      toast.error("Mã OTP không hợp lệ");
      return;
    }
    setStep(3);
  }

  async function handleResetPassword() {
    if (newPass.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {step === 1 && "Quên mật khẩu"}
            {step === 2 && "Nhập mã OTP"}
            {step === 3 && "Đặt lại mật khẩu"}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 mt-4">
          {step === 1 && (
            <>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleSendOtp} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Đang gửi...
                  </span>
                ) : (
                  "Gửi mã OTP"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Label>Mã OTP</Label>
              <Input
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Quay lại
                </Button>
                <Button onClick={handleVerifyOtp} disabled={loading}>
                  Tiếp tục
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Label>Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Label>Xác nhận mật khẩu</Label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Quay lại
                </Button>
                <Button onClick={handleResetPassword} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Đang xử lý...
                    </span>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
