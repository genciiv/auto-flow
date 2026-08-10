"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KeyRound, Loader2, Power, Save, ShieldCheck } from "lucide-react";

import { changeAdminUserGlobalRoleAction, changeAdminUserStatusAction, unlockAdminUserAction } from "@/app/admin/users/actions";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

export default function UserAdminActions({ user, currentAdminId }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [globalRole, setGlobalRole] = useState(user.globalRole || "NONE");

  function execute(action) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result?.success === false) throw new Error(result.message || "Veprimi dështoi.");
        toast.success(result?.message || "Veprimi përfundoi me sukses.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Veprimi nuk mund të përfundohej.");
      }
    });
  }

  async function handleStatusChange() {
    const nextActive = !user.isActive;
    const confirmed = await confirm({
      title: nextActive ? "Aktivizo përdoruesin" : "Çaktivizo përdoruesin",
      description: nextActive
        ? "Përdoruesi do të mund të hyjë përsëri në AutoFlow."
        : "Përdoruesi do të humbasë aksesin dhe sesionet aktive do të revokohen.",
      confirmLabel: nextActive ? "Aktivizo" : "Çaktivizo",
      tone: nextActive ? "warning" : "danger",
    });
    if (confirmed) execute(() => changeAdminUserStatusAction(user.id, nextActive));
  }

  async function handleRoleSave() {
    if (globalRole === (user.globalRole || "NONE")) return;
    const confirmed = await confirm({
      title: "Ndrysho rolin global",
      description: "Ky ndryshim ndikon në portalet ku përdoruesi ka akses dhe revokon sesionet ekzistuese.",
      confirmLabel: "Ruaj rolin",
      tone: globalRole === "PLATFORM_ADMIN" ? "warning" : "danger",
    });
    if (confirmed) execute(() => changeAdminUserGlobalRoleAction(user.id, globalRole));
  }

  async function handleUnlock() {
    const confirmed = await confirm({
      title: "Zhblloko llogarinë",
      description: "Tentativat e dështuara të hyrjes do të pastrohen dhe bllokimi do të hiqet.",
      confirmLabel: "Zhblloko",
      tone: "warning",
    });
    if (confirmed) execute(() => unlockAdminUserAction(user.id));
  }

  const isSelf = user.id === currentAdminId;

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Power size={18} /></div>
          <div>
            <h2 className="font-bold text-slate-950">Statusi i llogarisë</h2>
            <p className="mt-1 text-sm text-slate-500">Aktivizo ose ndalo aksesin e plotë të këtij përdoruesi.</p>
          </div>
        </div>
        <button type="button" onClick={handleStatusChange} disabled={isPending || (isSelf && user.isActive)} className={`mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${user.isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
          {user.isActive ? "Çaktivizo përdoruesin" : "Aktivizo përdoruesin"}
        </button>
        {isSelf ? <p className="mt-2 text-xs text-slate-500">Llogaria jote nuk mund të çaktivizohet nga kjo faqe.</p> : null}
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ShieldCheck size={18} /></div>
          <div>
            <h2 className="font-bold text-slate-950">Roli global</h2>
            <p className="mt-1 text-sm text-slate-500">Roli global është i ndarë nga roli OWNER/MANAGER/MECHANIC brenda një biznesi.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="text-sm font-semibold text-slate-700">Aksesi global</span>
            <select value={globalRole} onChange={(event) => setGlobalRole(event.target.value)} disabled={isPending || isSelf} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60">
              <option value="NONE">Pa rol global</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PLATFORM_ADMIN">Platform Admin</option>
            </select>
          </label>
          <button type="button" onClick={handleRoleSave} disabled={isPending || isSelf || globalRole === (user.globalRole || "NONE")} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Save size={16} /> Ruaj rolin
          </button>
        </div>
      </section>

      {user.isLocked || user.failedLoginAttempts > 0 ? (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><KeyRound size={18} /></div>
            <div><h2 className="font-bold text-amber-950">Siguria e hyrjes</h2><p className="mt-1 text-sm text-amber-800">Ka {user.failedLoginAttempts} tentativa të dështuara{user.isLocked ? " dhe llogaria është aktualisht e bllokuar" : ""}.</p></div>
          </div>
          <button type="button" onClick={handleUnlock} disabled={isPending} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"><KeyRound size={16} /> Zhblloko llogarinë</button>
        </section>
      ) : null}
    </div>
  );
}
