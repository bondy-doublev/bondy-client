"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarIcon,
  User,
  Mail,
  Shield,
  UserCircle2,
  Users,
  Check,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { authService } from "@/services/authService";

export default function InformationPageWithDatePicker() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dob, setDob] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [signupData, setSignupData] = useState<{
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("signupData");
    if (!data) {
      router.push("/signup");
      return;
    }
    setSignupData(JSON.parse(data));
  }, [router]);

  const canSubmit =
    firstName && lastName && gender && dob && signupData && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !signupData) return;

    setSubmitting(true);
    try {
      await authService.registerInit({
        email: signupData.email,
        password: signupData.password,
        firstName,
        middleName,
        lastName,
        gender: gender === "male",
        dob: dob!.toISOString(),
      });
      toast.success("Register init success! Check your email for OTP.");
      setOtpStep(true);
    } catch (err: any) {
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Info Card */}
          <div className="hidden md:flex flex-col justify-center space-y-6 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Welcome to Bondy!
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Join our community and connect with amazing people
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Create Your Profile
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tell us about yourself to personalize your experience
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Verify Your Email
                  </h3>
                  <p className="text-sm text-gray-600">
                    We will send you a code to confirm your email address
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your information is secure and will never be shared
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/signin")}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <Card className="shadow-2xl border-2 border-gray-100">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-2xl font-bold text-gray-900">
                {otpStep ? "Verify Your Email" : t("additionalInfo")}
              </CardTitle>
              <p className="text-center text-sm text-gray-500">
                {otpStep
                  ? "Enter the code we sent to your email"
                  : "Just a few more details to get started"}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {!otpStep && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-semibold text-gray-700"
                        >
                          {t("firstName")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          placeholder="John"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-semibold text-gray-700"
                        >
                          {t("lastName")}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          placeholder="Doe"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="middleName"
                        className="text-sm font-semibold text-gray-700"
                      >
                        {t("middleName")}{" "}
                        <span className="text-gray-400 text-xs">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="middleName"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Middle name"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  {/* Gender Section with click flag */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      {t("gender")} <span className="text-red-500">*</span>
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Male */}
                      <div
                        onClick={() => setGender("male")}
                        className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
        ${
          gender === "male"
            ? "bg-green-50 border-green-600"
            : "bg-white border-gray-200"
        }
        hover:bg-green-50 hover:border-green-500
      `}
                      >
                        <UserCircle2
                          className={`w-5 h-5 ${
                            gender === "male"
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            gender === "male"
                              ? "text-green-900"
                              : "text-gray-700"
                          }`}
                        >
                          {t("male")}
                        </span>
                      </div>

                      {/* Female */}
                      <div
                        onClick={() => setGender("female")}
                        className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
        ${
          gender === "female"
            ? "bg-green-50 border-green-600"
            : "bg-white border-gray-200"
        }
        hover:bg-green-50 hover:border-green-500
      `}
                      >
                        <UserCircle2
                          className={`w-5 h-5 ${
                            gender === "female"
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            gender === "female"
                              ? "text-green-900"
                              : "text-gray-700"
                          }`}
                        >
                          {t("female")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      {t("dob")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DatePicker
                        selected={dob}
                        onChange={(date: Date | null) => setDob(date)}
                        dateFormat="dd/MM/yyyy"
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        placeholderText="DD/MM/YYYY"
                        className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        wrapperClassName="w-full"
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        openToDate={new Date(2000, 0, 1)}
                      />
                      <CalendarIcon
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={18}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      You must be at least 13 years old to register
                    </p>
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
                        Processing...
                      </span>
                    ) : (
                      t("nextStep")
                    )}
                  </Button>
                </form>
              )}

              {/* OTP Step */}
              {otpStep && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!otpCode) return;
                    setSubmitting(true);
                    try {
                      await authService.registerVerify(
                        signupData!.email,
                        otpCode
                      );
                      toast.success("Register complete!");
                      sessionStorage.removeItem("signupData");
                      router.push("/signin");
                    } catch (err: any) {
                      toast.error(err.message || t("serverError"));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Check your email
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          We sent a verification code to{" "}
                          <span className="font-semibold">
                            {signupData?.email}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      Enter 6-digit code
                    </Label>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-3xl tracking-[0.5em] font-bold"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || otpCode.length !== 6}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Complete"
                    )}
                  </Button>

                  <button
                    type="button"
                    className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
                  >
                    Did not receive the code?{" "}
                    <span className="text-green-600 font-semibold">Resend</span>
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom CSS cho DatePicker */}
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .react-datepicker__header {
          background-color: #10b981;
          border-bottom: none;
          border-radius: 0.75rem 0.75rem 0 0;
          padding-top: 1rem;
        }

        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: white;
          font-weight: 600;
        }

        .react-datepicker__day {
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .react-datepicker__day:hover {
          background-color: #d1fae5;
          color: #065f46;
        }

        .react-datepicker__day--selected {
          background-color: #10b981 !important;
          color: white !important;
          font-weight: 700;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: #34d399;
        }

        .react-datepicker__day--disabled {
          color: #cbd5e1 !important;
          cursor: not-allowed !important;
          background-color: #f8fafc !important;
        }

        .react-datepicker__navigation-icon::before {
          border-color: white;
        }

        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }

        .react-datepicker__year-option:hover,
        .react-datepicker__month-option:hover {
          background-color: #d1fae5;
        }
      `}</style>
    </main>
  );
}
