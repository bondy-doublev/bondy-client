// app/payment/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { advertService } from "@/services/advertService";
import { paymentService } from "@/services/paymentService";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Toast } from "@/lib/toast";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const advertId = Number(params.id);
  const [advert, setAdvert] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "momo" | null>(
    null
  );

  useEffect(() => {
    async function fetchAdvert() {
      try {
        const data = await advertService.getById(advertId);
        setAdvert(data);
      } catch (error) {
        console.error("Failed to fetch advert:", error);
        Toast.error("Không thể tải thông tin quảng cáo");
      }
    }
    fetchAdvert();
  }, [advertId]);

  const handlePayment = async (method: "vnpay" | "momo") => {
    if (!advert) return;
    setLoading(true);

    try {
      const redirectUrl =
        window.location.origin + `/payment-success/${advert.id}`;

      if (method === "vnpay") {
        const { paymentUrl } = await paymentService.payWithVnpay(
          advert.totalPrice,
          redirectUrl
        );
        window.location.href = paymentUrl;
      } else {
        const res = await paymentService.payWithMomo(
          advert.totalPrice,
          redirectUrl
        );
        if (res && res.payUrl) {
          window.location.href = res.payUrl;
        }
      }
    } catch (error) {
      console.error(error);
      Toast.error("Thanh toán thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!advert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán quảng cáo
          </h1>
          <p className="text-gray-600">
            Hoàn tất thanh toán để quảng cáo của bạn được kích hoạt
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Advert Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Chi tiết đơn hàng
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Tiêu đề quảng cáo
                  </div>
                  <div className="font-semibold text-gray-900 mb-2">
                    {advert.title}
                  </div>

                  {/* Media thumbnails */}
                  {advert.media && advert.media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {advert.media.map((m: any, index: number) => (
                        <div
                          key={index}
                          className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 relative"
                        >
                          {m.type === "IMAGE" ? (
                            <img
                              src={m.url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                            />
                          )}
                          {m.type === "VIDEO" && (
                            <span className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                              Video
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Thời gian</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {advert.totalDays} ngày
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(advert.startDate).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(advert.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Giá mỗi ngày</span>
                    </div>
                    <div className="font-semibold text-green-700">
                      {advert.pricePerDay.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      x {advert.totalDays} ngày
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chọn phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {/* VNPay */}
                <button
                  onClick={() => setSelectedMethod("vnpay")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === "vnpay"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src="/images/payment/vnpay.jpg"
                          alt="VNPay"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">VNPay</div>
                        <div className="text-sm text-gray-500">
                          Thanh toán qua VNPay
                        </div>
                      </div>
                    </div>
                    {selectedMethod === "vnpay" && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>

                {/* Momo */}
                <button
                  onClick={() => setSelectedMethod("momo")}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedMethod === "momo"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src="/images/payment/momo.png"
                          alt="Momo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Momo</div>
                        <div className="text-sm text-gray-500">
                          Thanh toán qua Ví Momo
                        </div>
                      </div>
                    </div>
                    {selectedMethod === "momo" && (
                      <CheckCircle className="w-6 h-6 text-pink-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-900 mb-1">
                    Thanh toán bảo mật
                  </div>
                  <div className="text-sm text-blue-700">
                    Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt
                    đối. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-gray-200 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Tổng thanh toán</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Giá mỗi ngày</span>
                  <span>{advert.pricePerDay.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Số ngày</span>
                  <span>{advert.totalDays} ngày</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {advert.totalPrice.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </div>

              <button
                disabled={loading || !selectedMethod}
                onClick={() => selectedMethod && handlePayment(selectedMethod)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  loading || !selectedMethod
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : !selectedMethod ? (
                  "Chọn phương thức thanh toán"
                ) : (
                  `Thanh toán ${advert.totalPrice.toLocaleString("vi-VN")} đ`
                )}
              </button>

              {!selectedMethod && (
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Vui lòng chọn phương thức thanh toán</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
