"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home } from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import {
  loginWithDiscord,
  loginWithGithub,
  loginWithGoogle,
} from "@/lib/actions/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaDiscord } from "react-icons/fa";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Spinner from "@/app/components/ui/spinner";

export default function SignIn() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuthStore();

  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const canSubmit = isEmailValid && isPasswordValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await authService.signIn(email, password);
      setUser(response.user);
      router.push("/");
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
          <CardTitle className="text-center text-2xl">{t("signIn")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-4">
          {/* Social login */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={loginWithGoogle}
              className="flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} /> {t("signInWithGoogle")}
            </Button>

            <Button
              variant="default"
              onClick={loginWithGithub}
              className="flex items-center justify-center gap-2"
            >
              <FaGithub size={20} /> {t("signInWithGithub")}
            </Button>

            <Button
              variant="default"
              onClick={loginWithDiscord}
              className="flex items-center justify-center gap-2"
            >
              <FaDiscord size={20} /> {t("signInWithDiscord")}
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={isEmailValid ? "border-green-500" : "border-red-500"}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={
                    isPasswordValid ? "border-green-500" : "border-red-500"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(Boolean(checked))}
                />
                <Label htmlFor="remember">{t("rememberMe")}</Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" disabled={!canSubmit} className="w-full">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner /> {t("signingIn")}
                </span>
              ) : (
                t("signIn")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            {t("noAccount")}{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              {t("signUp")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
