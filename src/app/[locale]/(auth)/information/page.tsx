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
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

      toast.success(t("registerInitSuccess"));
      setOtpStep(true);
    } catch (err: any) {
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT */}
          <div className="flex-col justify-center hidden p-8 space-y-6 shadow-xl md:flex bg-white/80 rounded-2xl">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center bg-green-500 rounded-full w-14 h-14">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold">{t("welcomeToBondy")}</h1>
              </div>
              <p className="text-lg text-gray-600">{t("joinCommunity")}</p>
            </div>

            <div className="space-y-4">
              <InfoItem
                icon={<User />}
                title={t("createProfileTitle")}
                desc={t("createProfileDesc")}
              />
              <InfoItem
                icon={<Mail />}
                title={t("verifyEmailTitle")}
                desc={t("verifyEmailDesc")}
              />
              <InfoItem
                icon={<Shield />}
                title={t("privacyTitle")}
                desc={t("privacyDesc")}
              />
            </div>

            <p className="pt-4 text-sm text-gray-500 border-t">
              {t("alreadyHaveAccount")}{" "}
              <button
                onClick={() => router.push("/signin")}
                className="font-semibold text-green-600"
              >
                {t("signIn")}
              </button>
            </p>
          </div>

          {/* RIGHT */}
          <Card className="border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {otpStep ? t("verifyEmailTitle") : t("additionalInfo")}
              </CardTitle>
              <p className="text-sm text-center text-gray-500">
                {otpStep ? t("verifyEmailSubtitle") : t("additionalInfoDesc")}
              </p>
            </CardHeader>

            <CardContent>
              {!otpStep ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InputBlock
                      label={t("firstName")}
                      value={firstName}
                      onChange={setFirstName}
                      required
                    />
                    <InputBlock
                      label={t("lastName")}
                      value={lastName}
                      onChange={setLastName}
                      required
                    />
                  </div>

                  <InputBlock
                    label={t("middleName")}
                    value={middleName}
                    onChange={setMiddleName}
                    optional
                  />

                  <GenderSelect gender={gender} setGender={setGender} t={t} />

                  <div>
                    <Label>{t("dob")} *</Label>
                    <div className="relative">
                      <DatePicker
                        selected={dob}
                        onChange={(date) => setDob(date)}
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        placeholderText={t("datePlaceholder")}
                        className="w-full px-3 py-2.5 pr-10 border rounded-lg"
                      />
                      <CalendarIcon className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {t("ageLimitNote")}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full"
                  >
                    {submitting ? t("processing") : t("nextStep")}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (otpCode.length !== 6) return;
                    setSubmitting(true);
                    try {
                      await authService.registerVerify(
                        signupData!.email,
                        otpCode
                      );
                      toast.success(t("registerComplete"));
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
                  <p className="text-sm">
                    {t("otpSentDesc")} <b>{signupData?.email}</b>
                  </p>

                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    placeholder={t("otpPlaceholder")}
                    className="text-2xl tracking-widest text-center"
                  />

                  <Button
                    disabled={submitting || otpCode.length !== 6}
                    className="w-full"
                  >
                    {submitting ? t("verifying") : t("verifyComplete")}
                  </Button>

                  <button type="button" className="w-full text-sm">
                    {t("resendQuestion")}{" "}
                    <span className="font-semibold text-green-600">
                      {t("resend")}
                    </span>
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

/* ===== Helpers ===== */

function InfoItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function InputBlock({ label, value, onChange, required, optional }: any) {
  return (
    <div>
      <Label>
        {label} {required && "*"}{" "}
        {optional && <span className="text-xs text-gray-400">(Optional)</span>}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function GenderSelect({ gender, setGender, t }: any) {
  return (
    <div>
      <Label>{t("gender")} *</Label>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {["male", "female"].map((g) => (
          <div
            key={g}
            onClick={() => setGender(g)}
            className={`p-3 border rounded-lg cursor-pointer text-center ${
              gender === g ? "border-green-600 bg-green-50" : ""
            }`}
          >
            <UserCircle2 className="mx-auto mb-1" />
            {t(g)}
          </div>
        ))}
      </div>
    </div>
  );
}
