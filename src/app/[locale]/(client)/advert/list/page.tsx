"use client";

import { advertService } from "@/services/advertService";
import { useEffect, useState } from "react";
import { AdvertRequestResponse } from "@/types/response";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Video,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Toast } from "@/lib/toast";
import AdList from "../components/AdList";
import AdCard from "../components/AdCard";

function AdvertListPage() {
  const router = useRouter();
  const [adverts, setAdverts] = useState<AdvertRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvert, setSelectedAdvert] =
    useState<AdvertRequestResponse | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    handleGetAdverts();
  }, [user]);

  const handleGetAdverts = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await advertService.getMyRequests(user.id);
      setAdverts(res || []);
    } catch (error) {
      console.error("Failed to fetch adverts:", error);
      Toast.error("Không thể tải danh sách quảng cáo");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Quảng cáo của tôi
            </h1>
            <p className="text-gray-600">
              Quản lý tất cả các yêu cầu quảng cáo của bạn
            </p>
          </div>
          <button
            onClick={() => router.push("/advert")}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tạo mới
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : adverts?.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Chưa có quảng cáo
            </h3>
            <p className="text-gray-500 mb-6">
              Tạo quảng cáo đầu tiên của bạn để bắt đầu
            </p>
            <button
              onClick={() => router.push("/advert")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo quảng cáo mới
            </button>
          </div>
        ) : (
          <>
            {/* Adverts Grid (2 cards / row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adverts.map((advert) => (
                <div key={advert.id} className="relative">
                  {/* Card */}
                  <AdCard advert={advert} variant="full" />

                  {/* Footer actions */}
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => setSelectedAdvert(advert)}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Ad
                    </button>

                    {advert.status === "pending" && (
                      <button className="flex-1 px-4 py-2 bg-white hover:bg-red-50 text-red-500 font-medium rounded-lg border border-red-500">
                        Hủy
                      </button>
                    )}

                    {advert.status === "waiting_payment" && (
                      <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">
                        Thanh toán
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal hiển thị carousel khi bấm "Xem chi tiết" */}
        {selectedAdvert && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedAdvert(null)}
          >
            <div
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ===== Modal Header ===== */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Preview quảng cáo
                  </h2>
                  <p className="text-sm text-gray-500">
                    @{selectedAdvert.accountName}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAdvert(null)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* ===== Modal Content ===== */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <AdCard advert={selectedAdvert} variant="preview" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvertListPage;
