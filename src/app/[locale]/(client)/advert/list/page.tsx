"use client";

import { advertService } from "@/services/advertService";
import { useEffect, useState } from "react";
import { AdvertRequestResponse } from "@/types/response";
import { useRouter } from "next/navigation";
import { Plus, Image as ImageIcon, Eye } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Toast } from "@/lib/toast";
import AdCard from "../components/AdCard";
import { useTranslations } from "use-intl";

function AdvertListPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [adverts, setAdverts] = useState<AdvertRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvert, setSelectedAdvert] =
    useState<AdvertRequestResponse | null>(null);
  const t = useTranslations("advert");

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
      Toast.error(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              {t("myAdverts")}
            </h1>
            <p className="text-gray-600 text-sm">
              {t("manageAllYourAdRequests")}
            </p>
          </div>

          <button
            onClick={() => router.push("/advert")}
            className="flex items-center gap-2 sm:px-2 sm:py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("createNew")}
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : adverts.length === 0 ? (
          <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-white shadow-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">{t("noAdverts")}</h3>
            <p className="text-gray-500 mb-6">
              {t("createYourFirstAdvert")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adverts.map((advert) => (
              <div key={advert.id} className="relative">
                <AdCard
                  advert={advert}
                  variant="full"
                  showActions
                  onClose={handleGetAdverts} 
                />

                {/* Preview Button */}
                <button
                  onClick={() => setSelectedAdvert(advert)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-sm text-gray-800 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border border-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {t("viewAd")}
                </button>
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
                  <h2 className="font-bold">{t("previewAdvert")}</h2>
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
