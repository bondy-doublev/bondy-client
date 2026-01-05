"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, Image, Video, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { advertService } from "@/services/advertService";
import { uploadLocalMultiple } from "@/services/uploadService";
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
        uploadedUrls = await uploadLocalMultiple(filesToUpload);
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
    <div className="min-h-screen p-4 bg-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-gray-900">
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* FORM */}
          <div className="lg:col-span-1">
            <div className="p-6 space-y-5 bg-white border shadow-sm rounded-xl">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Plus className="w-5 h-5 text-green-500" />
                {t("advertInformation")}
              </h2>

              {/* Title */}
              <input
                className="w-full px-4 py-2 border rounded-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("advertTitle")}
              />

              {/* Dates */}
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                min={tomorrow}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setEndDate("");
                }}
              />

              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
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

              {/* Upload */}
              <label className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-500">
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

              {/* Media list */}
              {mediaUrls.length > 0 && (
                <div className="space-y-2">
                  {mediaUrls.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 text-sm border rounded bg-gray-50"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {m.type === "IMAGE" ? (
                          <Image className="w-4 h-4" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        <span className="truncate">
                          {m.file?.name || "Media"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMedia(i)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ================= PRICE INFO ================= */}
              <div className="p-4 space-y-2 border rounded-xl bg-green-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t("pricePerDay")}</span>
                  <span className="font-semibold text-green-700">
                    20,000 {t("vnd")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t("numberOfDays")}</span>
                  <span className="font-semibold">
                    {calculateTotalDays() > 0
                      ? `${calculateTotalDays()} ${t("days")}`
                      : "--"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold text-gray-900">
                    {t("totalPrice")}
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {calculateTotalDays() > 0
                      ? (20000 * calculateTotalDays()).toLocaleString() +
                        " " +
                        t("vnd")
                      : "--"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 font-bold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-xl"
              >
                {loading ? t("creating") : t("createAdvert")}
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-2xl font-bold">{t("preview")}</h2>

            {previewAdvert ? (
              <AdCard advert={previewAdvert} variant="preview" />
            ) : (
              <div className="p-12 text-center text-gray-500 border-2 border-dashed rounded-xl">
                {t("enterInfoToPreviewAdvert")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
