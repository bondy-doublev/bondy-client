"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { authService } from "@/services/authService";

export default function InformationPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dob, setDob] = useState<Date | undefined>();
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
      setOtpStep(true); // chuyển sang bước nhập OTP
    } catch (err: any) {
      toast.error(err.message || t("serverError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {t("additionalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!otpStep && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="middleName">{t("middleName")}</Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>{t("gender")}</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={(val: string) =>
                    setGender(val as "male" | "female")
                  }
                  className="flex gap-4 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">{t("male")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">{t("female")}</Label>
                  </div>
                </RadioGroup>
              </div>

              <Popover>
                <Label>{t("dob")}</Label>
                <PopoverTrigger asChild>
                  <Input
                    readOnly
                    value={dob ? dob.toLocaleDateString() : ""}
                    placeholder="Select date"
                    className="cursor-pointer"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white shadow-lg rounded-md">
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={setDob}
                    className="bg-white text-black rounded-md min-w-[300px]"
                  />
                </PopoverContent>
              </Popover>

              <Button type="submit" disabled={!canSubmit} className="w-full">
                {submitting ? "Submitting..." : t("nextStep")}
              </Button>
            </form>
          )}

          {otpStep && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!otpCode) return;
                setSubmitting(true);
                try {
                  await authService.registerVerify(signupData!.email, otpCode);
                  toast.success("Register complete!");
                  router.push("/signin");
                } catch (err: any) {
                  toast.error(err.message || t("serverError"));
                } finally {
                  setSubmitting(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <Label>OTP Code</Label>
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Verify OTP"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
