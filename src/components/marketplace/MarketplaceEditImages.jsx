"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Trash2, Undo2, Upload } from "lucide-react";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function formatFileSize(size) {
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileIdentifier(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function MarketplaceEditImages({ existingImages = [] }) {
  const inputRef = useRef(null);
  const selectedItemsRef = useRef([]);

  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);

  useEffect(() => {
    return () => {
      selectedItemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  const retainedExistingImages = existingImages.filter(
    (image) => !deletedImageIds.includes(image.id),
  );

  const totalActiveImages =
    retainedExistingImages.length + selectedItems.length;

  function synchronizeInput(items) {
    if (!inputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();

    items.forEach((item) => {
      dataTransfer.items.add(item.file);
    });

    inputRef.current.files = dataTransfer.files;
  }

  function validateFiles(files) {
    if (retainedExistingImages.length + files.length > MAX_IMAGES) {
      return `Publikimi mund të ketë maksimumi ${MAX_IMAGES} fotografi.`;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `"${file.name}" nuk është JPG, PNG ose WebP.`;
      }

      if (file.size <= 0) {
        return `"${file.name}" është bosh.`;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return `"${file.name}" është më e madhe se 5 MB.`;
      }
    }

    return "";
  }

  function handleFiles(event) {
    const incomingFiles = Array.from(event.target.files || []);

    if (incomingFiles.length === 0) {
      return;
    }

    const existingIdentifiers = new Set(
      selectedItems.map((item) => getFileIdentifier(item.file)),
    );

    const uniqueIncomingFiles = incomingFiles.filter((file) => {
      const identifier = getFileIdentifier(file);

      if (existingIdentifiers.has(identifier)) {
        return false;
      }

      existingIdentifiers.add(identifier);

      return true;
    });

    const allNewFiles = [
      ...selectedItems.map((item) => item.file),
      ...uniqueIncomingFiles,
    ];

    const validationError = validateFiles(allNewFiles);

    if (validationError) {
      setError(validationError);
      synchronizeInput(selectedItems);
      return;
    }

    const newItems = uniqueIncomingFiles.map((file) => ({
      id: `${getFileIdentifier(file)}-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    const updatedItems = [...selectedItems, ...newItems];

    setError("");
    setSelectedItems(updatedItems);
    synchronizeInput(updatedItems);
  }

  function removeNewImage(itemId) {
    const itemToRemove = selectedItems.find((item) => item.id === itemId);

    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.url);
    }

    const updatedItems = selectedItems.filter((item) => item.id !== itemId);

    setSelectedItems(updatedItems);
    setError("");
    synchronizeInput(updatedItems);
  }

  function toggleExistingImage(imageId) {
    setDeletedImageIds((currentIds) => {
      if (currentIds.includes(imageId)) {
        return currentIds.filter((id) => id !== imageId);
      }

      return [...currentIds, imageId];
    });

    setError("");
  }

  function clearNewImages() {
    selectedItems.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });

    setSelectedItems([]);
    setError("");
    synchronizeInput([]);
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-bold text-slate-950">Fotografitë</h2>

        <p className="mt-1 text-sm text-slate-500">
          Menaxho fotografitë ekzistuese ose shto fotografi të reja.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {existingImages.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Fotografitë ekzistuese
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Fotografia e parë aktive përdoret si fotografia kryesore.
                </p>
              </div>

              <p className="text-xs font-semibold text-slate-500">
                {retainedExistingImages.length} aktive
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {existingImages.map((image, index) => {
                const isDeleted = deletedImageIds.includes(image.id);

                return (
                  <div
                    key={image.id}
                    className={`relative overflow-hidden rounded-2xl border bg-slate-100 ${
                      isDeleted
                        ? "border-red-300 opacity-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.alt || `Fotografia ${index + 1}`}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover"
                      />
                    </div>

                    {!isDeleted && index === 0 ? (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        <Star size={11} fill="currentColor" />
                        Kryesore
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleExistingImage(image.id)}
                      className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition ${
                        isDeleted
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                      aria-label={
                        isDeleted ? "Rikthe fotografinë" : "Fshi fotografinë"
                      }
                    >
                      {isDeleted ? <Undo2 size={15} /> : <Trash2 size={15} />}
                    </button>

                    {isDeleted ? (
                      <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-3 py-2 text-center text-xs font-bold text-white">
                        Do të fshihet
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {deletedImageIds.map((imageId) => (
          <input
            key={imageId}
            type="hidden"
            name="deleteImageIds"
            value={imageId}
          />
        ))}

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-300 hover:bg-blue-50/40">
          <input
            ref={inputRef}
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleFiles}
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ImagePlus size={26} />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-900">
            Shto fotografi të reja
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            JPG, PNG ose WebP. Maksimumi 5 MB për fotografi.
          </p>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
            <Upload size={15} />
            Zgjidh fotografitë
          </span>
        </label>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {selectedItems.length > 0 ? (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  Fotografitë e reja
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Do të ngarkohen kur të ruash ndryshimet.
                </p>
              </div>

              <button
                type="button"
                onClick={clearNewImages}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                Hiqi të gjitha të rejat
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={item.url}
                      alt={item.file.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, 220px"
                      className="object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNewImage(item.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm hover:bg-red-50"
                    aria-label="Hiq fotografinë"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-white">
                    <p className="truncate text-xs font-semibold">
                      {item.file.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/80">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="text-xs font-semibold text-slate-500">
          {totalActiveImages} nga {MAX_IMAGES} fotografi aktive
        </p>
      </div>
    </section>
  );
}
