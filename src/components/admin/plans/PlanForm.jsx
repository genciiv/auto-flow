"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save, X } from "lucide-react";

import { createPlanAction, updatePlanAction } from "@/app/admin/plans/actions";

function getFeaturesText(features) {
  if (!Array.isArray(features)) {
    return "";
  }

  return features.filter((feature) => typeof feature === "string").join("\n");
}

export default function PlanForm({ plan = null }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  const isEditing = Boolean(plan?.id);
  const isFreeTrial = plan?.slug === "free-trial";

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updatePlanAction(plan.id, formData)
          : await createPlanAction(formData);

        setMessage({
          type: "success",
          text:
            result?.message ||
            (isEditing
              ? "Plani u përditësua me sukses."
              : "Plani u krijua me sukses."),
        });

        router.refresh();

        setTimeout(() => {
          router.push("/admin/plans");
        }, 700);
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Veprimi nuk mund të përfundohej.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {message ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
          )}

          <p className="font-medium">{message.text}</p>
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Informacioni i planit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vendos emrin, përshkrimin dhe identifikuesin e planit.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Emri i planit
            </span>

            <input
              type="text"
              name="name"
              required
              minLength={2}
              defaultValue={plan?.name || ""}
              placeholder="P.sh. Professional"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Slug</span>

            <input
              type="text"
              name="slug"
              defaultValue={plan?.slug || ""}
              disabled={isFreeTrial}
              placeholder="professional"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              {isFreeTrial
                ? "Slug-u i Free Trial nuk mund të ndryshohet."
                : "Nëse lihet bosh, krijohet automatikisht nga emri."}
            </p>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-700">
            Përshkrimi
          </span>

          <textarea
            name="description"
            rows={4}
            defaultValue={plan?.description || ""}
            placeholder="Përshkruaj shkurt se për cilat biznese është ky plan."
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Çmimet e abonimit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vendos çmimin mujor dhe vjetor në Lekë.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Çmimi mujor
            </span>

            <div className="relative mt-2">
              <input
                type="number"
                name="monthlyPrice"
                required
                min="0"
                step="0.01"
                disabled={isFreeTrial}
                defaultValue={plan?.monthlyPrice ?? 0}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Lekë
              </span>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Çmimi vjetor
            </span>

            <div className="relative mt-2">
              <input
                type="number"
                name="yearlyPrice"
                required
                min="0"
                step="0.01"
                disabled={isFreeTrial}
                defaultValue={plan?.yearlyPrice ?? 0}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Lekë
              </span>
            </div>
          </label>
        </div>

        {isFreeTrial ? (
          <>
            <input type="hidden" name="monthlyPrice" value="0" />
            <input type="hidden" name="yearlyPrice" value="0" />

            <p className="mt-4 text-sm text-amber-700">
              Free Trial është falas dhe çmimet e tij nuk mund të ndryshohen.
            </p>
          </>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Limitet e përdorimit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Lëri bosh fushat që nuk duhet të kenë kufizim.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Maksimumi i përdoruesve
            </span>

            <input
              type="number"
              name="maxUsers"
              min="1"
              step="1"
              defaultValue={plan?.maxUsers ?? ""}
              placeholder="Pa limit"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Maksimumi i klientëve
            </span>

            <input
              type="number"
              name="maxCustomers"
              min="1"
              step="1"
              defaultValue={plan?.maxCustomers ?? ""}
              placeholder="Pa limit"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Maksimumi i automjeteve
            </span>

            <input
              type="number"
              name="maxVehicles"
              min="1"
              step="1"
              defaultValue={plan?.maxVehicles ?? ""}
              placeholder="Pa limit"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Veçoritë e planit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Shkruaj çdo veçori në një rresht të ri.
          </p>
        </div>

        <label className="mt-6 block">
          <span className="sr-only">Veçoritë</span>

          <textarea
            name="features"
            rows={7}
            defaultValue={getFeaturesText(plan?.features)}
            placeholder={`Menaxhim klientësh\nMenaxhim automjetesh\nFatura dhe pagesa\nRaporte mujore`}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Statusi dhe renditja
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Kontrollo dukshmërinë dhe pozicionin e planit.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_220px]">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={isFreeTrial || plan?.isActive !== false}
              disabled={isFreeTrial}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Plan aktiv
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Plani mund të përdoret për abonime të reja.
              </span>
            </span>
          </label>

          {isFreeTrial ? (
            <input type="hidden" name="isActive" value="on" />
          ) : null}

          <label
            className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 ${
              isFreeTrial ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              name="isRecommended"
              defaultChecked={Boolean(plan?.isRecommended)}
              disabled={isFreeTrial}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Plan i rekomanduar
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Shfaqet si zgjedhja kryesore për bizneset.
              </span>
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Renditja
            </span>

            <input
              type="number"
              name="sortOrder"
              min="0"
              step="1"
              defaultValue={plan?.sortOrder ?? 0}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              Numri më i vogël shfaqet i pari.
            </p>
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={() => router.push("/admin/plans")}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={17} />
          Anulo
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Duke ruajtur...
            </>
          ) : (
            <>
              <Save size={17} />
              {isEditing ? "Ruaj ndryshimet" : "Krijo planin"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
