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

interface AdCardProps {
  advert: AdvertRequestResponse;
  variant?: "full" | "preview";
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
  const isPreview = variant === "preview";

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
      waiting_payment: "bg-orange-100 text-orange-700 border-orange-300",
      paid: "bg-blue-100 text-blue-700 border-blue-300",
      running: "bg-green-100 text-green-700 border-green-300",
      done: "bg-gray-100 text-gray-700 border-gray-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
      cancelled: "bg-gray-100 text-gray-500 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Chờ duyệt",
      waiting_payment: "Chờ thanh toán",
      paid: "Đã thanh toán",
      running: "Đang chạy",
      done: "Hoàn thành",
      rejected: "Từ chối",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto max-h-[90vh] flex flex-col">
      {/* ================= MEDIA ================= */}
      <div className="relative bg-gray-100 h-[45vh] max-h-[420px] flex-shrink-0">
        {/* ===== PREVIEW USER HEADER ===== */}
        {isPreview && (
          <>
            {/* ===== TOP USER INFO ===== */}
            <div
              className="absolute top-0 left-0 right-0 z-10 p-4
                    bg-gradient-to-b from-black/60 to-transparent"
            >
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

            {/* ===== BOTTOM TITLE ===== */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 p-4
                    bg-gradient-to-t from-black/70 to-transparent"
            >
              <h3 className="text-white font-semibold text-lg line-clamp-2 max-w-[90%]">
                {advert.title}
              </h3>
            </div>
          </>
        )}

        {/* ===== MEDIA CONTENT ===== */}
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
                src={advert.media[currentMediaIndex].url}
                controls
                className="w-full h-full object-cover"
              />
            )}

            {advert.media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      {!isPreview && (
        <div className="p-6 overflow-y-auto flex-1">
          {/* Header */}
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
                Thời gian
              </div>
              <div className="font-semibold">{advert.totalDays} ngày</div>
              <div className="text-xs text-gray-500">
                {formatDate(advert.startDate)} → {formatDate(advert.endDate)}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Chi phí
              </div>
              <div className="font-semibold text-green-700">
                {formatPrice(advert.totalPrice)}
              </div>
              <div className="text-xs text-green-600">
                {formatPrice(advert.pricePerDay)} / ngày
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                {advert.media.some((m) => m.type === "VIDEO") ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
                <span className="font-medium text-sm">Media</span>
              </div>

              <div className="font-semibold text-blue-700">
                {advert.media.length} file
              </div>

              <div className="text-xs text-blue-600 mt-1">
                {advert.media.filter((m) => m.type === "IMAGE").length} ảnh,{" "}
                {advert.media.filter((m) => m.type === "VIDEO").length} video
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Tạo lúc: {new Date(advert.createdAt).toLocaleString("vi-VN")}
          </div>

          {showActions && (
            <div className="flex gap-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Đóng
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
