"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  Clock3,
  Loader2,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  transitionServiceAction,
  updateServiceWorkflowAction,
} from "@/actions/service-workflow-actions";

const labels = {
  DRAFT: "Projekt",
  PENDING: "Në pritje",
  IN_PROGRESS: "Në proces",
  WAITING_FOR_PARTS: "Në pritje të pjesëve",
  READY_FOR_PICKUP: "Gati për dorëzim",
  COMPLETED: "Përfunduar",
  DELIVERED: "Dorëzuar",
  CANCELLED: "Anuluar",
};

const roleLabels = {
  OWNER: "Pronar",
  MANAGER: "Menaxher",
  MECHANIC: "Mekanik",
  RECEPTIONIST: "Recepsionist",
  WAREHOUSE: "Magazinier",
  ACCOUNTANT: "Financier",
};

const nextStatuses = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: [
    "WAITING_FOR_PARTS",
    "READY_FOR_PICKUP",
    "COMPLETED",
    "CANCELLED",
  ],
  WAITING_FOR_PARTS: ["IN_PROGRESS", "READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["IN_PROGRESS", "COMPLETED", "DELIVERED"],
  COMPLETED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const workflowSteps = [
  "PENDING",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "DELIVERED",
];

function getStepState(currentStatus, stepStatus) {
  if (currentStatus === "CANCELLED") {
    return "inactive";
  }

  if (currentStatus === stepStatus) {
    return "current";
  }

  const currentIndex = workflowSteps.indexOf(currentStatus);
  const stepIndex = workflowSteps.indexOf(stepStatus);

  if (currentStatus === "DRAFT") {
    return "inactive";
  }

  if (currentIndex > stepIndex) {
    return "complete";
  }

  return "inactive";
}

export default function ServiceWorkflowPanel({
  service,
  staff,
  businessRole,
  canManageAssignment,
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [transitionNote, setTransitionNote] = useState("");

  async function save(formData) {
    setBusy(true);
    setMessage("");

    const result = await updateServiceWorkflowAction(formData);

    setMessage(result.message);
    setBusy(false);
  }

  async function transition(status) {
    setBusy(true);
    setMessage("");

    const result = await transitionServiceAction(
      service.id,
      status,
      transitionNote,
    );

    if (result.success) {
      setTransitionNote("");
    }

    setMessage(result.message);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Fleta e punës</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">
              Ecuria e urdhër-punës
            </h2>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            <CircleDot size={16} />
            {labels[service.status]}
          </span>
        </div>

        <div className="relative mt-7 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {workflowSteps.map((step) => {
            const state = getStepState(service.status, step);

            return (
              <div
                key={step}
                className={`relative rounded-2xl border px-4 py-4 text-sm transition ${
                  state === "current"
                    ? "border-blue-300 bg-blue-50 text-blue-800 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
                    : state === "complete"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50/70 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {state === "complete" ? (
                    <CheckCircle2 size={16} />
                  ) : state === "current" ? (
                    <Wrench size={16} />
                  ) : (
                    <Clock3 size={16} />
                  )}

                  <div><span className="block text-[11px] font-bold uppercase tracking-wider opacity-60">Hapi</span><span className="mt-0.5 block font-semibold leading-tight">{labels[step]}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.72fr)]">
        <div className="space-y-6">
          <form
            action={save}
            className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Wrench size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Të dhënat teknike
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Regjistro problemin e raportuar, diagnozën dhe shënimet e
                  ekipit.
                </p>
              </div>
            </div>

            <input type="hidden" name="serviceId" value={service.id} />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Problemi i raportuar nga klienti
                </label>
                <textarea
                  name="description"
                  defaultValue={service.description || ""}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  placeholder="P.sh. makina humbet fuqi, dëgjohet zhurmë gjatë frenimit..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Mekaniku përgjegjës
                </label>

                {canManageAssignment ? (
                  <select
                    name="assignedUserId"
                    defaultValue={service.assignedUserId || ""}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="">Pa caktuar</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type="hidden"
                      name="assignedUserId"
                      value={service.assignedUserId || ""}
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      <UserRound size={16} />
                      {service.assignedUser?.name || "Pa caktuar"}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Roli aktiv
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {roleLabels[businessRole] || businessRole}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Diagnoza e mekanikut
                </label>
                <textarea
                  name="diagnosis"
                  defaultValue={service.diagnosis || ""}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  placeholder="Defekti i konstatuar, kontrollet e kryera dhe puna e rekomanduar..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Shënime të brendshme
                </label>
                <textarea
                  name="internalNotes"
                  defaultValue={service.internalNotes || ""}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  placeholder={
                    businessRole === "MECHANIC"
                      ? "Shënime teknike për ekipin..."
                      : "Shënime vetëm për stafin e servisit..."
                  }
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                Ruaj fletën e punës
              </button>
            </div>
          </form>

          <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Historiku i statusit
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Çdo ndryshim ruhet bashkë me përdoruesin, datën dhe shënimin.
            </p>

            <div className="mt-5 space-y-4">
              {service.statusHistory.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nuk ka ende ndryshime statusi.
                </p>
              ) : (
                service.statusHistory.map((history) => (
                  <div
                    key={history.id}
                    className="relative border-l-2 border-blue-200 pb-1 pl-5 before:absolute before:-left-[7px] before:top-1 before:size-3 before:rounded-full before:border-2 before:border-white before:bg-blue-500"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {labels[history.fromStatus] || "Krijuar"} →{" "}
                      {labels[history.toStatus]}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {history.changedBy?.name || "Sistemi"} ·{" "}
                      {new Date(history.createdAt).toLocaleString("sq-AL")}
                    </p>
                    {history.note ? (
                      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {history.note}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Hapi i radhës
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Shto një shënim dhe vazhdo urdhër-punën në statusin e duhur.
            </p>

            {nextStatuses[service.status].length > 0 ? (
              <textarea
                value={transitionNote}
                onChange={(event) => setTransitionNote(event.target.value)}
                rows={3}
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                placeholder="Shënim opsional, p.sh. priten disqet e frenave..."
              />
            ) : null}

            <div className="mt-4 grid gap-3">
              {nextStatuses[service.status].length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ky proces është mbyllur.
                </p>
              ) : (
                nextStatuses[service.status].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={busy}
                    onClick={() => transition(status)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
                  >
                    Kalo në: {labels[status]}
                  </button>
                ))
              )}
            </div>

            {message ? (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </p>
            ) : null}
          </section>

          <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Afatet</h2>
            <div className="mt-4 space-y-3 text-sm">
              <DateRow label="Krijuar" value={service.createdAt} />
              <DateRow label="Filluar" value={service.startedAt} />
              <DateRow label="Gati" value={service.readyAt} />
              <DateRow label="Përfunduar" value={service.completedAt} />
              <DateRow label="Dorëzuar" value={service.deliveredAt} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DateRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">
        {value ? new Date(value).toLocaleString("sq-AL") : "—"}
      </span>
    </div>
  );
}
