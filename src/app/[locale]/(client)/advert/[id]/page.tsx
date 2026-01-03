"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { advertService } from "@/services/advertService";
import { AdvertRequestResponse } from "@/types/response";
import { ArrowLeft, Share2, Flag } from "lucide-react";
import { Toast } from "@/lib/toast";
import AdCard from "../components/AdCard";

export default function AdvertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [advert, setAdvert] = useState<AdvertRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAdvertDetail(Number(params.id));
    }
  }, [params.id]);

  const fetchAdvertDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await advertService.getById(id);
      setAdvert(res);
    } catch (error) {
      console.error("Failed to fetch advert:", error);
      Toast.error("Không thể tải thông tin quảng cáo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!advert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy quảng cáo
          </h2>
          <p className="text-gray-600 mb-6">
            Quảng cáo này có thể đã bị xóa hoặc không tồn tại
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Ad Card */}
        <div className="mb-8">
          <AdCard variant="preview-aspect" advert={advert} showActions={false} />
        </div>
      </div>
    </div>
  );
}
