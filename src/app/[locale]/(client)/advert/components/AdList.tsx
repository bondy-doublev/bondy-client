"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AdvertRequestResponse } from "@/types/response";
import AdCard from "./AdCard";

interface AdListProps {
  adverts: AdvertRequestResponse[];
  showModal?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function AdList({
  adverts,
  showModal = false,
  autoPlay = false,
  autoPlayInterval = 5000,
}: AdListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextAdvert = () => {
    setCurrentIndex((prev) => (prev === adverts.length - 1 ? 0 : prev + 1));
  };

  const prevAdvert = () => {
    setCurrentIndex((prev) => (prev === 0 ? adverts.length - 1 : prev - 1));
  };

  // Auto play
  useState(() => {
    if (autoPlay && adverts.length > 1) {
      const interval = setInterval(nextAdvert, autoPlayInterval);
      return () => clearInterval(interval);
    }
  });

  if (adverts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">
          <p className="text-lg">Không có quảng cáo nào</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        {adverts.length > 1 && (
          <>
            <button
              onClick={prevAdvert}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Quảng cáo trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextAdvert}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Quảng cáo tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Current Advert */}
        <div
          onClick={() => showModal && setIsModalOpen(true)}
          className={showModal ? "cursor-pointer" : ""}
        >
          <AdCard advert={adverts[currentIndex]} showActions={false} />
        </div>

        {/* Counter & Indicators */}
        {adverts.length > 1 && (
          <div className="mt-6 space-y-4">
            {/* Text Counter */}
            <div className="text-center text-gray-600">
              Đang xem quảng cáo {currentIndex + 1} / {adverts.length}
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2">
              {adverts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-green-600 w-8"
                      : "bg-gray-300 w-2 hover:bg-gray-400"
                  }`}
                  aria-label={`Đến quảng cáo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[98vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Navigation */}
            {adverts.length > 1 && (
              <>
                <button
                  onClick={prevAdvert}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  aria-label="Quảng cáo trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextAdvert}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  aria-label="Quảng cáo tiếp theo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Modal Content */}
            <AdCard
              advert={adverts[currentIndex]}
              showActions={true}
              onClose={() => setIsModalOpen(false)}
            />

            {/* Modal Indicators */}
            {adverts.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {adverts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-white w-8"
                        : "bg-white/50 w-2 hover:bg-white/75"
                    }`}
                    aria-label={`Đến quảng cáo ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
