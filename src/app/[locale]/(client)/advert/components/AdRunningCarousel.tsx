"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { advertService } from "@/services/advertService";
import { useTranslations } from "use-intl";

interface Advert {
  id: number;
  status: string;
  media: { url: string; type: "IMAGE" | "VIDEO" }[];
  title: string;
  userId: number;
  userAvatar?: string;
  accountName: string;
}

export default function AdRunningCarousel() {
  const router = useRouter();
  const [ads, setAds] = useState<Advert[]>([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations("advert")

  /* =========================
   * FETCH ACTIVE ADS
   * ========================= */
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await advertService.getActiveAdverts();
        setAds(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAds();
  }, []);

  /* =========================
   * AUTO SLIDE
   * ========================= */
  useEffect(() => {
    if (ads.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ads]);

  const handleAdClick = (adId: number) => {
    // Navigate to advert detail page
    router.push(`/advert/${adId}`);
  };

  if (!ads.length) return null;

  const currentAd = ads[index];

  return (
    <div
      className="w-full bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
      onMouseLeave={() => {
        timerRef.current = setInterval(() => {
          setIndex((prev) => (prev + 1) % ads.length);
        }, 5000);
      }}
      onClick={() => handleAdClick(currentAd.id)}
    >
      {/* MEDIA */}
      <div className="relative h-[180px] bg-gray-100">
        {currentAd.media[0]?.type === "IMAGE" ? (
          <img
            src={currentAd.media[0].url}
            className="w-full h-full object-cover"
            alt={currentAd.title}
          />
        ) : (
          <video
            src={currentAd.media[0].url}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
          />
        )}

        {/* BADGE */}
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
          {t("sponsored")}
        </span>

        {/* MEDIA COUNT */}
        {currentAd.media.length > 1 && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {currentAd.media.length} {t("media")}
          </span>
        )}
      </div>

      {/* INFO */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {currentAd.userAvatar ? (
            <img
              src={currentAd.userAvatar}
              className="w-6 h-6 rounded-full object-cover"
              alt={currentAd.accountName}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 text-xs flex items-center justify-center font-semibold text-gray-600">
              {currentAd.accountName.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="text-sm font-semibold truncate">
            {currentAd.accountName}
          </span>
        </div>

        <div className="text-sm font-medium line-clamp-2 text-gray-800">
          {currentAd.title}
        </div>
      </div>

      {/* DOTS INDICATOR */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1 pb-3">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index
                  ? "bg-green-600 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`${t("viewAd")} ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
