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
  const { setUser, setUserProfile } = useAuthStore();

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
      setUserProfile(response.data.user);
      toast.success(t("welcomeBackToast"));
      router.push("/");
    } catch (err: any) {
      console.log("Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem("email_hash");
    if (savedEmail) setEmail(atob(savedEmail));
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-5xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Side - Welcome Back Card */}
          <div className="flex-col justify-center hidden p-8 space-y-6 shadow-xl md:flex bg-white/80 backdrop-blur-sm rounded-2xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center bg-green-500 rounded-full w-14 h-14">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {t("welcomeBackTitle")}
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                {t("welcomeBackSubtitle")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg">
                  <LogIn className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("quickAccessTitle")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("quickAccessDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("stayUpdatedTitle")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("stayUpdatedDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("secureLoginTitle")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("secureLoginDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t("communityTitle")}
                  </h3>
                  <p className="text-sm text-gray-600">{t("communityDesc")}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t("newToBondy")}{" "}
                <Link href="/signup" className="font-semibold text-green-600">
                  {t("createAccount")}
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <Card className="border-2 border-gray-100 shadow-2xl">
            <CardHeader className="pb-4 space-y-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 mb-2 text-sm text-gray-500 hover:text-gray-700 w-fit"
              >
                <Home size={16} /> {t("home")}
              </Link>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                {t("signIn")}
              </CardTitle>
              <p className="text-sm text-center text-gray-500">
                {t("signInDesc")}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={loginWithGoogle}
                  className="flex items-center justify-center w-full gap-2 transition-colors h-11 hover:bg-gray-50"
                >
                  <FcGoogle size={20} />
                  <span>{t("signInWithGoogle")}</span>
                </Button>

                <Button
                  onClick={loginWithDiscord}
                  className="flex items-center justify-center w-full gap-2 transition-colors h-11"
                  style={{ backgroundColor: "#5865F2" }}
                >
                  <FaDiscord size={20} />
                  <span>{t("signInWithDiscord")}</span>
                </Button>
              </div>

              {/* OR Divider */}
              <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-300" />
                <span className="px-3 text-sm font-medium text-gray-500">
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
                    placeholder={t("emailPlaceholder")}
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
                    <p className="mt-1 text-xs text-red-500">
                      {t("invalidEmail")}
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
                      placeholder={t("passwordPlaceholder")}
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
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && !isPasswordValid && (
                    <p className="mt-1 text-xs text-red-500">
                      {t("passwordRange")}
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
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-3 mt-6 font-semibold text-white transition-colors bg-green-600 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      {t("signingIn")}
                    </span>
                  ) : (
                    t("signIn")
                  )}
                </Button>
              </form>

              {/* Mobile: New to Bondy */}
              <p className="mt-6 text-sm text-center text-gray-600 md:hidden">
                {t("noAccount")}{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-green-600 hover:text-green-700"
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
