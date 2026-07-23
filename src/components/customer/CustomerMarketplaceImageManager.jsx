"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
const MAX = 10,
  MAX_SIZE = 5 * 1024 * 1024,
  TYPES = ["image/jpeg", "image/png", "image/webp"];
export default function CustomerMarketplaceImageManager({
  existingImages = [],
}) {
  const inputRef = useRef(null),
    itemsRef = useRef([]);
  const [existing, setExisting] = useState(existingImages),
    [deleted, setDeleted] = useState([]),
    [items, setItems] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(
    () => () => itemsRef.current.forEach((x) => URL.revokeObjectURL(x.url)),
    [],
  );
  const sync = (list) => {
    if (!inputRef.current) return;
    const d = new DataTransfer();
    list.forEach((x) => d.items.add(x.file));
    inputRef.current.files = d.files;
  };
  function add(e) {
    const incoming = Array.from(e.target.files || []);
    const merged = [...items.map((x) => x.file), ...incoming];
    if (existing.length + merged.length > MAX) {
      setError(`Maksimumi ${MAX} fotografi.`);
      sync(items);
      return;
    }
    for (const f of merged) {
      if (!TYPES.includes(f.type) || f.size > MAX_SIZE) {
        setError("Lejohen JPG, PNG, WebP deri në 5 MB.");
        sync(items);
        return;
      }
    }
    const newItems = incoming.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
    }));
    const next = [...items, ...newItems];
    setItems(next);
    setError("");
    sync(next);
  }
  function removeNew(id) {
    const x = items.find((i) => i.id === id);
    if (x) URL.revokeObjectURL(x.url);
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    sync(next);
  }
  const previews = [
    ...existing.map((x) => ({ ...x, old: true })),
    ...items.map((x) => ({ ...x, old: false })),
  ];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold">Fotografitë</h2>
      {deleted.map((id) => (
        <input key={id} type="hidden" name="deleteImageIds" value={id} />
      ))}
      <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 p-8">
        <input
          ref={inputRef}
          type="file"
          name="images"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={add}
        />
        <ImagePlus className="text-blue-600" />
        <span className="mt-2 text-sm font-bold">Shto fotografi</span>
      </label>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {previews.map((x, i) => (
          <div
            key={x.id}
            className="relative aspect-square overflow-hidden rounded-2xl border"
          >
            <Image
              src={x.url}
              alt={x.alt || "Foto"}
              fill
              unoptimized
              className="object-cover"
            />
            {i === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                <Star size={10} className="inline" /> Kryesore
              </span>
            ) : null}
            <button
              type="button"
              onClick={() =>
                x.old
                  ? (setExisting((v) => v.filter((y) => y.id !== x.id)),
                    setDeleted((v) => [...v, x.id]))
                  : removeNew(x.id)
              }
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
