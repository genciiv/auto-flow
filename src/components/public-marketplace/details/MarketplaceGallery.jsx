"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export default function MarketplaceGallery({ images = [], title }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex];

  function showPreviousImage() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === 0) {
        return images.length - 1;
      }

      return currentIndex - 1;
    });
  }

  function showNextImage() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === images.length - 1) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/11] items-center justify-center rounded-[2rem] border border-slate-200 bg-slate-100">
        <div className="text-center text-slate-400">
          <ImageIcon size={48} strokeWidth={1.5} className="mx-auto" />

          <p className="mt-3 text-sm font-semibold">
            Ky publikim nuk ka fotografi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100">
        <div className="aspect-[16/11]">
          <img
            src={activeImage.url}
            alt={activeImage.alt || title}
            className="h-full w-full object-cover"
          />
        </div>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Fotografia e mëparshme"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:bg-white hover:text-blue-600"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label="Fotografia tjetër"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:bg-white hover:text-blue-600"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-4 right-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Shfaq fotografinë ${index + 1}`}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                  isActive
                    ? "border-blue-600 ring-4 ring-blue-600/10"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt || `${title} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
