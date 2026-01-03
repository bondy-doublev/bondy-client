"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, Upload, Image, Video } from "lucide-react";
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
  const [createdAds, setCreatedAds] = useState<AdvertRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);

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

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (totalDays <= 0) {
      Toast.warning("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    setLoading(true);

    try {
      // Upload file
      const filesToUpload = mediaUrls.filter((m) => m.file).map((m) => m.file!);
      let uploadedUrls: string[] = [];
      if (filesToUpload.length) {
        uploadedUrls = await uploadCloudinaryMultiple(filesToUpload);
      }

      const media = mediaUrls.map((m) => ({
        type: m.type,
        url: m.file ? uploadedUrls.shift()! : m.url,
      }));

      const req = {
        userId: user?.id || 0,
        title,
        accountName,
        startDate,
        endDate,
        totalDays,
        pricePerDay: 20000,
        totalPrice: 20000 * totalDays,
        media,
      };

      const res = await advertService.create(req);
      if (res) {
        setCreatedAds((prev) => [res, ...prev]);
        Toast.success("Tạo quảng cáo thành công!");
        setTitle("");
        setMediaUrls([]);
        setStartDate("");
        setEndDate("");
      }
    } catch (err) {
      Toast.error("Tạo quảng cáo thất bại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Quản lý Quảng cáo
          </h1>
          <p className="text-gray-600">
            Tạo và quản lý các chiến dịch quảng cáo của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Tạo quảng cáo mới
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tài khoản
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tên tài khoản"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề quảng cáo
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tiêu đề"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-green-500 focus:outline-none transition-colors"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-green-500 focus:outline-none transition-colors"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media (Ảnh/Video)
                  </label>
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                    <Upload className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Chọn ảnh hoặc video
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Media Preview Grid */}
                  {mediaUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {mediaUrls.map((m, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-500 transition-all"
                        >
                          {m.type === "IMAGE" ? (
                            <img
                              src={m.url}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <video
                              src={m.url}
                              className="w-full h-32 object-cover"
                            />
                          )}

                          {/* Overlay with type badge */}
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            {m.type === "IMAGE" ? (
                              <Image className="w-3 h-3" />
                            ) : (
                              <Video className="w-3 h-3" />
                            )}
                            {m.type}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => handleRemoveMedia(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* File name */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs truncate">
                              {m.file?.name || "Media"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700 font-medium">
                      Giá / ngày:
                    </span>
                    <span className="text-green-600 font-bold">20,000 VNĐ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-bold">Tổng cộng:</span>
                    <span className="text-green-600 font-bold text-lg">
                      {(20000 * calculateTotalDays()).toLocaleString()} VNĐ
                    </span>
                  </div>
                  {calculateTotalDays() > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      {calculateTotalDays()} ngày
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo...
                    </span>
                  ) : (
                    "Tạo quảng cáo"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Ads List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Danh sách quảng cáo ({createdAds.length})
            </h2>

            {createdAds.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chưa có quảng cáo
                </h3>
                <p className="text-gray-500">
                  Tạo quảng cáo đầu tiên của bạn để bắt đầu
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {createdAds.map((ad) => (
                  <AdCard key={ad.id} advert={ad} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
