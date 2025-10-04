"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import {
  loginWithDiscord,
  loginWithGithub,
  loginWithGoogle,
} from "@/lib/actions/auth";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaGithub } from "react-icons/fa";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// Spinner custom
function Spinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8";
  return (
    <div
      className={`animate-spin rounded-full border-2 border-t-2 border-gray-300 ${sizeClass}`}
    />
  );
}

export default function SignUp() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const canSubmit = isEmailValid && isPasswordValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // lưu tạm email + password + agree vào query params hoặc sessionStorage
      sessionStorage.setItem("signupData", JSON.stringify({ email, password }));

      router.push("/information"); // chuyển sang trang nhập full info
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <Link
            href="/"
            className="flex items-center gap-2 mb-4 text-sm text-gray-500"
          >
            <Home size={16} /> {t("home")}
          </Link>
          <CardTitle className="text-center text-2xl">{t("signUp")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Social login */}
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={loginWithGoogle}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} /> {t("signInWithGoogle")}
            </Button>

            <Button
              style={{ backgroundColor: "#5865F2", color: "white" }}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={loginWithDiscord}
            >
              <FaDiscord size={20} /> {t("signInWithDiscord")}
            </Button>
          </div>

          {/* OR divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">{t("or")}</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Normal signup form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={
                  !email
                    ? ""
                    : isEmailValid
                    ? "border-green-500"
                    : "border-red-500"
                }
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={
                    !password
                      ? ""
                      : isPasswordValid
                      ? "border-green-500"
                      : "border-red-500"
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Agree */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(checked) => setAgree(Boolean(checked))}
              />
              <Label htmlFor="agree">{t("agreeTerms")}</Label>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={!canSubmit} className="w-full">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> {t("signingUp")}
                </span>
              ) : (
                t("nextStep")
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-4">
            {t("alreadyAccount")}{" "}
            <Link href="/signin" className="text-blue-600 hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
