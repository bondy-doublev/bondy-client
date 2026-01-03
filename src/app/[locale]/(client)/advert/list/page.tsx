"use client";

import { advertService } from "@/services/advertService";
import { useEffect, useState } from "react";
import { AdvertRequestResponse } from "@/types/response";
import { useRouter } from "next/navigation";
import { Plus, Image as ImageIcon, Eye } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Toast } from "@/lib/toast";
import AdCard from "../components/AdCard";
import ConfirmDialog from "@/app/components/dialog/ConfirmDialog";

function AdvertListPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [adverts, setAdverts] = useState<AdvertRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvert, setSelectedAdvert] =
    useState<AdvertRequestResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    handleGetAdverts();
  }, [user]);

  const handleGetAdverts = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await advertService.getMyRequests(Number(user.id));
      setAdverts(res || []);
    } catch (error) {
      console.error(error);
      Toast.error("Không thể tải danh sách quảng cáo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
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
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tạo mới
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : adverts.length === 0 ? (
          <div className="border-2 border-gray-200 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Chưa có quảng cáo</h3>
            <p className="text-gray-500 mb-6">
              Tạo quảng cáo đầu tiên của bạn để bắt đầu
            </p>
            <button
              onClick={() => router.push("/advert")}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Tạo quảng cáo mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adverts.map((advert) => (
              <div key={advert.id}>
                <AdCard advert={advert} variant="full" />

                {/* ===== ACTIONS ===== */}
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setSelectedAdvert(advert)}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>

                  {advert.status === "pending" && (
                    <ConfirmDialog
                      title="Hủy quảng cáo"
                      description="Bạn có chắc chắn muốn hủy quảng cáo này không? Hành động này không thể hoàn tác."
                      confirmText="Hủy quảng cáo"
                      cancelText="Đóng"
                      loadingText="Đang hủy..."
                      onConfirm={async () => {
                        try {
                          await advertService.updateStatus(
                            advert.id,
                            "cancelled"
                          );
                          Toast.success("Đã hủy quảng cáo thành công");
                          await handleGetAdverts();
                        } catch (err) {
                          console.error(err);
                          Toast.error("Hủy quảng cáo thất bại");
                        }
                      }}
                      trigger={
                        <button className="flex-1 px-4 py-2 bg-white hover:bg-red-50 text-red-500 rounded-lg border border-red-500">
                          Hủy
                        </button>
                      }
                    />
                  )}

                  {advert.status === "waiting_payment" && (
                    <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                      Thanh toán
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= PREVIEW MODAL ================= */}
        {selectedAdvert && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setSelectedAdvert(null)}
          >
            <div
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="font-bold">Preview quảng cáo</h2>
                  <p className="text-sm text-gray-500">
                    @{selectedAdvert.accountName}
                  </p>
                </div>
                <button onClick={() => setSelectedAdvert(null)}>✕</button>
              </div>

              <div className="p-6 bg-gray-50 overflow-y-auto">
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
