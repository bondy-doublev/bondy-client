"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Upload,
  Image,
  Video,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { advertService } from "@/services/advertService";
import { uploadCloudinaryMultiple } from "@/services/uploadService";
import { AdvertRequestResponse } from "@/types/response";
import { Toast } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import AdCard from "./components/AdCard";

interface MediaItem {
  url: string;
  type: "IMAGE" | "VIDEO";
  file?: File;
}

export default function AdvertPage() {
  const { user } = useAuthStore();
  const router = useRouter();

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

  /* ================= UTILS ================= */
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  /* ================= PREVIEW ================= */
  const previewAdvert: AdvertRequestResponse | null =
    title || mediaUrls.length > 0
      ? {
          id: 0,
          title: title || "Tiêu đề quảng cáo",
          accountName: accountName || "Tên tài khoản",
          userId: user?.id || 0,
          userAvatar: user?.avatarUrl || "",
          startDate,
          userEmail: user?.email || "",
          endDate,
          totalDays: calculateTotalDays(),
          pricePerDay: 20000,
          totalPrice: 20000 * calculateTotalDays(),
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
      mediaUrls.length === 0 ||
      !startDate ||
      !endDate
    ) {
      Toast.warning("Vui lòng điền đầy đủ thông tin và thêm media");
      return;
    }

    const totalDays = calculateTotalDays();
    if (totalDays <= 0) {
      Toast.warning("Ngày kết thúc phải sau ngày bắt đầu");
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
        pricePerDay: 20000,
        totalPrice: 20000 * totalDays,
        userAvatar: user?.avatarUrl || "",
        media,
      });

      Toast.success("Tạo quảng cáo thành công!");
      router.push("/advert/list");
    } catch (err) {
      Toast.error("Tạo quảng cáo thất bại!");
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
              Tạo quảng cáo
            </h1>
            <p className="text-gray-600">
              Xem trước quảng cáo giống hệt khi hiển thị thật
            </p>
          </div>

          <button
            onClick={() => router.push("/advert/list")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Về danh sách
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ================= FORM ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-xl p-6 shadow-sm sticky top-4 space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Thông tin quảng cáo
              </h2>

              {/* Account name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tên tài khoản
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-4 py-2"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tiêu đề quảng cáo
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-4 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border px-4 py-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border px-4 py-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload */}
              <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-green-500">
                <Upload className="w-5 h-5 mr-2" />
                Thêm ảnh / video
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
                      className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 text-sm"
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
              <div className="rounded-xl border bg-green-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Giá / ngày</span>
                  <span className="font-semibold text-green-700">
                    20,000 VNĐ
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Số ngày chạy</span>
                  <span className="font-semibold">
                    {calculateTotalDays() > 0
                      ? `${calculateTotalDays()} ngày`
                      : "--"}
                  </span>
                </div>

                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Tổng tiền</span>
                  <span className="font-bold text-green-700 text-lg">
                    {calculateTotalDays() > 0
                      ? (20000 * calculateTotalDays()).toLocaleString() + " VNĐ"
                      : "--"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
              >
                {loading ? "Đang tạo..." : "Tạo quảng cáo"}
              </button>
            </div>
          </div>

          {/* ================= PREVIEW ================= */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Xem trước</h2>

            {previewAdvert ? (
              <div className="max-h-[600px] overflow-hidden rounded-xl">
                <AdCard advert={previewAdvert} variant="preview" />
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-500">
                Nhập thông tin để xem trước quảng cáo
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
