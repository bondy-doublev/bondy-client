"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Video,
  ImageIcon,
} from "lucide-react";
import { AdvertRequestResponse } from "@/types/response";
import ConfirmDialog from "@/app/components/dialog/ConfirmDialog";
import { advertService } from "@/services/advertService";
import { Toast } from "@/lib/toast";
import { useTranslations } from "use-intl";
import { resolveFileUrl } from "@/utils/fileUrl";

interface AdCardProps {
  advert: AdvertRequestResponse;
  variant?: "full" | "preview" | "preview-aspect";
  showActions?: boolean;
  onClose?: () => void;
}

export default function AdCard({
  advert,
  variant = "full",
  showActions = false,
  onClose,
}: AdCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const t = useTranslations("advert");

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) =>
      prev === advert.media.length - 1 ? 0 : prev + 1
    );
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) =>
      prev === 0 ? advert.media.length - 1 : prev - 1
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      running: "bg-green-100 text-green-700 border-green-300",
      done: "bg-gray-100 text-gray-700 border-gray-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
      cancelled: "bg-gray-100 text-gray-500 border-gray-300",
      accepted: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: t("pending"),
      running: t("running"),
      done: t("done"),
      rejected: t("rejected"),
      cancelled: t("cancelled"),
      accepted: t("accepted"),
    };
    return texts[status] || status;
  };

  const isPreview = variant === "preview" || variant === "preview-aspect";
  const isAspect = variant === "preview-aspect";

  // Preview aspect - Full screen với blur background
  if (isAspect) {
    return (
      <div className="w-[70vw] h-screen mx-auto relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 scroll-custom">
        {/* Blurred Background */}
        {advert.media[currentMediaIndex] && (
          <div className="absolute inset-0">
            {advert.media[currentMediaIndex].type === "IMAGE" ? (
              <div
                className="w-full h-full scale-110 bg-center bg-cover opacity-50 filter blur-3xl"
                style={{
                  backgroundImage: `url(${advert.media[currentMediaIndex].url})`,
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex flex-col w-full h-full">
          {/* Top User Info */}
          <div className="p-6 bg-gradient-to-b from-black/60 to-transparent">
            <Link
              href={`/user/${advert.userId}`}
              className="flex items-center gap-3 text-white transition-opacity w-fit hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              {advert.userAvatar ? (
                <img
                  src={resolveFileUrl(advert.userAvatar)}
                  alt={advert.accountName}
                  className="object-cover w-12 h-12 border-2 rounded-full shadow-lg border-white/50"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white border-2 rounded-full bg-white/20 backdrop-blur-sm border-white/50">
                  {advert.accountName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="block text-lg font-semibold">
                  {advert.accountName}
                </span>
                <span className="text-sm text-white/80">{t("sponsored")}</span>
              </div>
            </Link>
          </div>

          {/* Media Container */}
          <div className="flex items-center justify-center flex-1 px-4 pb-4">
            <div className="relative max-w-full max-h-full">
              {advert.media[currentMediaIndex].type === "IMAGE" ? (
                <img
                  src={resolveFileUrl(advert.media[currentMediaIndex].url)}
                  alt={advert.title}
                  className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-2xl shadow-2xl"
                />
              ) : (
                <video
                  src={resolveFileUrl(advert.media[currentMediaIndex].url)}
                  controls
                  className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-2xl shadow-2xl"
                />
              )}

              {/* Media Navigation */}
              {advert.media.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute p-3 text-white transition-all -translate-y-1/2 rounded-full shadow-lg left-4 top-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextMedia}
                    className="absolute p-3 text-white transition-all -translate-y-1/2 rounded-full shadow-lg right-4 top-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
            <h3 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">
              {advert.title}
            </h3>

            {/* Media Indicators */}
            {advert.media.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {advert.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentMediaIndex
                        ? "bg-white w-8"
                        : "bg-white/40 hover:bg-white/60 w-2"
                    }`}
                    aria-label={`${t("media")} ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard preview or full card
  return (
    <div
      className={`
        bg-white shadow-lg overflow-hidden scroll-custom flex flex-col
        ${
          isPreview
            ? "rounded-xl max-w-4xl mx-auto"
            : "rounded-xl max-w-4xl mx-auto max-h-[90vh]"
        }
      `}
    >
      {/* Media Section */}
      <div className="relative bg-gray-100 h-[45vh] max-h-[420px] flex-shrink-0">
        {/* Preview User Header */}
        {isPreview && (
          <>
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <Link
                href={`/user/${advert.userId}`}
                className="flex items-center gap-3 text-white w-fit"
                onClick={(e) => e.stopPropagation()}
              >
                {advert.userAvatar ? (
                  <img
                    src={resolveFileUrl(advert.userAvatar)}
                    alt={advert.accountName}
                    className="object-cover w-10 h-10 border rounded-full border-white/50"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-gray-700 bg-gray-300 rounded-full">
                    {advert.accountName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold">{advert.accountName}</span>
              </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-white font-semibold text-lg line-clamp-2 max-w-[90%]">
                {advert.title}
              </h3>
            </div>
          </>
        )}

        {/* Media Content */}
        {advert.media.length > 0 && (
          <>
            {advert.media[currentMediaIndex].type === "IMAGE" ? (
              <img
                src={resolveFileUrl(advert.media[currentMediaIndex].url)}
                alt={advert.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <video
                src={resolveFileUrl(advert.media[currentMediaIndex].url)}
                controls
                className="object-cover w-full h-full"
              />
            )}

            {/* Media Navigation */}
            {advert.media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute z-10 p-2 text-white transition-colors -translate-y-1/2 rounded-full left-2 top-1/2 bg-black/50 hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextMedia}
                  className="absolute z-10 p-2 text-white transition-colors -translate-y-1/2 rounded-full right-2 top-1/2 bg-black/50 hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Media Indicators */}
                <div className="absolute flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
                  {advert.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentMediaIndex(index);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        index === currentMediaIndex
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75 w-2"
                      }`}
                      aria-label={`Media ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Content Section */}
      {!isPreview && (
        <div className="flex-1 p-6 overflow-y-auto scroll-custom">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center min-w-0 gap-3">
              {advert.userAvatar && (
                <img
                  src={resolveFileUrl(advert.userAvatar)}
                  alt={advert.accountName}
                  className="object-cover w-10 h-10 rounded-full"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{advert.title}</h2>
                <p className="text-sm text-gray-500 truncate">
                  @{advert.accountName}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                advert.status
              )}`}
            >
              {getStatusText(advert.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                {t("time")}
              </div>
              <div className="font-semibold">
                {advert.totalDays} {t("days")}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(advert.startDate)} → {formatDate(advert.endDate)}
              </div>
            </div>

            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2 text-green-700">
                <DollarSign className="w-4 h-4" />
                {t("cost")}
              </div>
              <div className="font-semibold text-green-700">
                {formatPrice(advert.totalPrice)}
              </div>
              <div className="text-xs text-green-600">
                {formatPrice(advert.pricePerDay)} / {t("day")}
              </div>
            </div>

            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                {advert.media.some((m) => m.type === "VIDEO") ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{t("media")}</span>
              </div>
              <div className="font-semibold text-blue-700">
                {advert.media.length} {t("file")}
              </div>
              <div className="mt-1 text-xs text-blue-600">
                {advert.media.filter((m) => m.type === "IMAGE").length}{" "}
                {t("image")},{" "}
                {advert.media.filter((m) => m.type === "VIDEO").length}{" "}
                {t("video")}
              </div>
            </div>
          </div>

          <div className="mb-4 text-xs text-gray-500">
            {t("createdAt")}:{" "}
            {new Date(advert.createdAt).toLocaleString("vi-VN")}
          </div>

          {showActions && (
            <div className="absolute z-20 flex gap-2 bottom-4 right-6">
              {/* Hủy */}
              {(advert.status === "pending" || advert.status === "running") && (
                <ConfirmDialog
                  title={t("cancelAdvert")}
                  description={t("cancelAdvertDescription")}
                  confirmText={t("cancelAdvert")}
                  cancelText={t("close")}
                  loadingText={t("cancelling")}
                  onConfirm={async () => {
                    try {
                      await advertService.updateStatus(advert.id, "cancelled");
                      Toast.success(t("cancelAdvertSuccess"));
                      onClose?.();
                    } catch (err) {
                      console.error(err);
                      Toast.error(t("cancelAdvertFailed"));
                    }
                  }}
                  trigger={
                    <button className="px-3 py-1 text-white bg-red-500 rounded-lg shadow-lg hover:bg-red-600">
                      {t("cancel")}
                    </button>
                  }
                />
              )}

              {/* Thanh toán */}
              {advert.status === "accepted" && (
                <button
                  onClick={() =>
                    (window.location.href = `/payment/${advert.id}`)
                  }
                  className="px-3 py-1 text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600"
                >
                  {t("pay")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
