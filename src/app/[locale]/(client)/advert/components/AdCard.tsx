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
      <div className="w-[70vw] h-screen mx-auto relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Blurred Background */}
        {advert.media[currentMediaIndex] && (
          <div className="absolute inset-0">
            {advert.media[currentMediaIndex].type === "IMAGE" ? (
              <div
                className="w-full h-full bg-cover bg-center filter blur-3xl scale-110 opacity-50"
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
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Top User Info */}
          <div className="p-6 bg-gradient-to-b from-black/60 to-transparent">
            <Link
              href={`/user/${advert.userId}`}
              className="flex items-center gap-3 text-white w-fit hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {advert.userAvatar ? (
                <img
                  src={advert.userAvatar}
                  alt={advert.accountName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/50">
                  {advert.accountName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-semibold text-lg block">
                  {advert.accountName}
                </span>
                <span className="text-sm text-white/80">{t("sponsored")}</span>
              </div>
            </Link>
          </div>

          {/* Media Container */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4">
            <div className="relative max-w-full max-h-full">
              {advert.media[currentMediaIndex].type === "IMAGE" ? (
                <img
                  src={advert.media[currentMediaIndex].url}
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-3 rounded-full transition-all shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
            <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">
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
        bg-white shadow-lg overflow-hidden flex flex-col
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
                    src={advert.userAvatar}
                    alt={advert.accountName}
                    className="w-10 h-10 rounded-full object-cover border border-white/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">
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
                src={advert.media[currentMediaIndex].url}
                alt={advert.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={resolveFileUrl(advert.media[currentMediaIndex].url)}
                controls
                className="w-full h-full object-cover"
              />
            )}

            {/* Media Navigation */}
            {advert.media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Media Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              {advert.userAvatar && (
                <img
                  src={advert.userAvatar}
                  alt={advert.accountName}
                  className="w-10 h-10 rounded-full object-cover"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
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

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
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

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                {advert.media.some((m) => m.type === "VIDEO") ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span className="font-medium text-sm">{t("media")}</span>
              </div>
              <div className="font-semibold text-blue-700">
                {advert.media.length} {t("file")}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {advert.media.filter((m) => m.type === "IMAGE").length}{" "}
                {t("image")},{" "}
                {advert.media.filter((m) => m.type === "VIDEO").length}{" "}
                {t("video")}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            {t("createdAt")}:{" "}
            {new Date(advert.createdAt).toLocaleString("vi-VN")}
          </div>

          {showActions && (
            <div className="absolute bottom-4 right-6 flex gap-2 z-20">
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
                    <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg">
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
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg"
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
