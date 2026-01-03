"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Home,
  LogIn,
  Shield,
  Zap,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import {
  loginWithDiscord,
  loginWithGithub,
  loginWithGoogle,
} from "@/lib/actions/auth";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord } from "react-icons/fa";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
  const isPasswordValid = password.length >= 8 && password.length <= 24;
  const canSubmit = isEmailValid && isPasswordValid && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await authService.login(email, password);
      if (remember) {
        localStorage.setItem("email_hash", btoa(email));
      } else {
        localStorage.removeItem("email_hash");
      }
      setUser(response.data.user);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem("email_hash");
    if (savedEmail) setEmail(atob(savedEmail));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Welcome Back Card */}
          <div className="hidden md:flex flex-col justify-center space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Welcome Back!
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Sign in to continue your journey with Bondy
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogIn className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Quick Access
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sign in with your email or use social login for instant
                    access
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Stay Updated
                  </h3>
                  <p className="text-sm text-gray-600">
                    See what your friends are sharing and discover new content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Secure Login
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your credentials are protected with end-to-end encryption
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Community Awaits
                  </h3>
                  <p className="text-sm text-gray-600">
                    Reconnect with your community and share your moments
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                New to Bondy?{" "}
                <Link
                  href="/signup"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <Card className="shadow-2xl border-2 border-gray-100">
            <CardHeader className="space-y-1 pb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2 w-fit"
              >
                <Home size={16} /> {t("home")}
              </Link>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">
                {t("signIn")}
              </CardTitle>
              <p className="text-center text-sm text-gray-500">
                Enter your credentials to access your account
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-2 h-11 hover:bg-gray-50 transition-colors"
                >
                  <FcGoogle size={20} />
                  <span>{t("signInWithGoogle")}</span>
                </Button>

                <Button
                  onClick={loginWithDiscord}
                  className="w-full flex items-center justify-center gap-2 h-11 transition-colors"
                  style={{ backgroundColor: "#5865F2" }}
                >
                  <FaDiscord size={20} />
                  <span>{t("signInWithDiscord")}</span>
                </Button>
              </div>

              {/* OR Divider */}
              <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-300" />
                <span className="px-3 text-sm text-gray-500 font-medium">
                  {t("or")}
                </span>
                <hr className="flex-grow border-gray-300" />
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-1.5 ${
                      email.length === 0
                        ? ""
                        : isEmailValid
                        ? "border-green-500 focus:ring-green-500"
                        : "border-red-500 focus:ring-red-500"
                    }`}
                    required
                  />
                  {email && !isEmailValid && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    {t("password")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pr-10 ${
                        password.length === 0
                          ? ""
                          : isPasswordValid
                          ? "border-green-500 focus:ring-green-500"
                          : "border-red-500 focus:ring-red-500"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && !isPasswordValid && (
                    <p className="text-xs text-red-500 mt-1">
                      Password must be 8-24 characters
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(checked) =>
                        setRemember(Boolean(checked))
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      {t("rememberMe")}
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    t("signIn")
                  )}
                </Button>
              </form>

              {/* Mobile: New to Bondy */}
              <p className="text-center text-sm text-gray-600 mt-6 md:hidden">
                {t("noAccount")}{" "}
                <Link
                  href="/signup"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  {t("signUp")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
