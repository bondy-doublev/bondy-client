"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { advertService } from "@/services/advertService";
import { mailService } from "@/services/mailService";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle,
  Home,
  FileText,
  Mail,
  Calendar,
  DollarSign,
  Loader2,
  XCircle,
} from "lucide-react";
import { Toast } from "@/lib/toast";
import confetti from "canvas-confetti";
import { useTranslations } from "use-intl";

export default function PaymentSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const advertId = Number(params.id);

  const [advert, setAdvert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("advert");

  useEffect(() => {
    if (advertId && user?.id) {
      processPaymentSuccess();
    }
  }, [advertId, user]);

  const processPaymentSuccess = async () => {
    try {
      setProcessing(true);

      const advertData = await advertService.getById(advertId);
      if (!advertData) throw new Error(t("notFound"));
      setAdvert(advertData);

      await advertService.updateStatus(advertId, "running");

      if (user?.email) {
        await mailService.sendPaymentSuccess({
          to: user.email,
          userName: user.name || advertData.accountName,
          advertTitle: advertData.title,
          amount: advertData.totalPrice,
        });
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      Toast.success(t("paymentSuccess"));
    } catch (err: any) {
      console.error("Payment processing error:", err);
      setError(err.message || t("processingError"));
      Toast.error(t("processingError"));
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("processing")}
          </h2>
          <p className="text-gray-600">{t("pleaseDoNotClose")}</p>
        </div>
      </div>
    );
  }

  if (error || !advert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("errorOccurred")}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || t("paymentProcessingFailed")}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/advert/list")}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              {t("backToList")}
            </button>
            <button
              onClick={() => processPaymentSuccess()}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-green-400 rounded-full animate-ping opacity-20 mx-auto" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {t("paymentSuccess")}
          </h1>
          <p className="text-lg text-gray-600">{t("advertActivated")}</p>
        </div>

        {/* Advert Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-green-500 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">
              {t("advertInformation")}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {t("advertTitle")}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {advert.title}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Duration */}
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{t("time")}</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {advert.totalDays}
                </div>
                <div className="text-sm text-blue-600">{t("days")}</div>
                <div className="text-xs text-blue-600 mt-2">
                  {new Date(advert.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(advert.endDate).toLocaleDateString("vi-VN")}
                </div>
              </div>

              {/* Amount */}
              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">{t("paid")}</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {(advert.totalPrice / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-green-600">
                  {advert.totalPrice.toLocaleString("vi-VN")} đ
                </div>
              </div>

              {/* Status */}
              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{t("status")}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border-2 border-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {t("running")}
                </div>
              </div>
            </div>

            {/* Email Notification */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900 mb-1">
                    {t("emailConfirmationSent")}
                  </div>
                  <div className="text-sm text-blue-700">
                    {t("emailConfirmationMessage", { email: user?.email || "" })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-all shadow-sm hover:shadow-md"
          >
            <Home className="w-5 h-5" />
            {t("backToHome")}
          </button>

          <button
            onClick={() => router.push("/advert/list")}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <FileText className="w-5 h-5" />
            {t("viewMyAdverts")}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t("advertWillBeDisplayedIn5To10Minutes")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t("ifYouHaveQuestionsPlease")}
            <button
              onClick={() => router.push("/support")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              {t("contactSupport")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
