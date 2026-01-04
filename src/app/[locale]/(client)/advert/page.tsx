"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, Image, Video, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { advertService } from "@/services/advertService";
import { uploadCloudinaryMultiple } from "@/services/uploadService";
import { AdvertRequestResponse } from "@/types/response";
import { Toast } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import AdCard from "./components/AdCard";
import { useTranslations } from "use-intl";

interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
  file?: File;
}

const PRICE_PER_DAY = 20000;

export default function AdvertPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const t = useTranslations("advert");

  const [title, setTitle] = useState("");
  const [accountName, setAccountName] = useState(
    user?.fullName ||
      [user?.firstName, user?.middleName, user?.lastName]
        .filter(Boolean)
        .join(" ") ||
      ""
  );

  const [mediaUrls, setMediaUrls] = useState<MediaItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= DATE UTILS ================= */

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return formatDate(d);
  })();

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  };

  const totalDays = calculateTotalDays();
  const totalPrice = totalDays * PRICE_PER_DAY;

  /* ================= PREVIEW ================= */

  const previewAdvert: AdvertRequestResponse | null =
    title || mediaUrls.length > 0
      ? {
          id: 0,
          title: title || t("advertTitle"),
          accountName: accountName || t("accountName"),
          userId: user?.id || 0,
          userAvatar: user?.avatarUrl || "",
          userEmail: user?.email || "",
          startDate,
          endDate,
          totalDays,
          pricePerDay: PRICE_PER_DAY,
          totalPrice,
          status: "pending",
          createdAt: new Date().toISOString(),
          media: mediaUrls.map((m) => ({
            type: m.type,
            url: m.url,
          })),
        }
      : null;

  /* ================= HANDLERS ================= */

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
    }));

    setMediaUrls((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !accountName ||
      !startDate ||
      !endDate ||
      mediaUrls.length === 0
    ) {
      Toast.warning(t("pleaseFillAllFieldsAndAddMedia"));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start < new Date(tomorrow)) {
      Toast.warning(t("startDateMustBeFromTomorrow"));
      return;
    }

    if (start >= end) {
      Toast.warning(t("endDateMustBeAfterStartDate"));
      return;
    }

    setLoading(true);

    try {
      const filesToUpload = mediaUrls.filter((m) => m.file).map((m) => m.file!);

      let uploadedUrls: string[] = [];

      if (filesToUpload.length) {
        uploadedUrls = await uploadCloudinaryMultiple(filesToUpload);
      }

      const media = mediaUrls.map((m) => ({
        type: m.type,
        url: m.file ? uploadedUrls.shift()! : m.url,
      }));

      await advertService.create({
        userId: user?.id || 0,
        userEmail: user?.email || "",
        title,
        accountName,
        startDate,
        endDate,
        totalDays,
        pricePerDay: PRICE_PER_DAY,
        totalPrice,
        userAvatar: user?.avatarUrl || "",
        media,
      });

      Toast.success(t("advertCreatedSuccessfully"));
      router.push("/advert/list");
    } catch (err) {
      Toast.error(t("advertCreationFailed"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {t("createAdvert")}
            </h1>
            <p className="text-gray-600">{t("previewAdvertExact")}</p>
          </div>

          <button
            onClick={() => router.push("/advert/list")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToList")}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                {t("advertInformation")}
              </h2>

              {/* Title */}
              <input
                className="w-full rounded-lg border px-4 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("advertTitle")}
              />

              {/* Dates */}
              <input
                type="date"
                className="w-full rounded-lg border px-4 py-2"
                min={tomorrow}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate("");
                }}
              />

              <input
                type="date"
                className="w-full rounded-lg border px-4 py-2"
                disabled={!startDate}
                min={
                  startDate
                    ? formatDate(
                        new Date(new Date(startDate).getTime() + 86400000)
                      )
                    : undefined
                }
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              {/* PRICE INFO */}
              <div className="rounded-xl border bg-green-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("pricePerDay")}</span>
                  <span className="font-semibold text-green-700">
                    {PRICE_PER_DAY.toLocaleString()} {t("vnd")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>{t("numberOfDays")}</span>
                  <span className="font-semibold">
                    {totalDays > 0 ? `${totalDays} ${t("days")}` : "--"}
                  </span>
                </div>

                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">{t("totalPrice")}</span>
                  <span className="font-bold text-green-700 text-lg">
                    {totalDays > 0
                      ? `${totalPrice.toLocaleString()} ${t("vnd")}`
                      : "--"}
                  </span>
                </div>
              </div>

              {/* Upload */}
              <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-green-500">
                <Upload className="w-5 h-5 mr-2" />
                {t("addPhotosVideos")}
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </label>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-xl text-white font-bold"
              >
                {loading ? t("creating") : t("createAdvert")}
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">{t("preview")}</h2>

            {previewAdvert ? (
              <AdCard advert={previewAdvert} variant="preview" />
            ) : (
              <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-500">
                {t("enterInfoToPreviewAdvert")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
