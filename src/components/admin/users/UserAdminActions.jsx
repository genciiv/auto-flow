"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  BadgeCheck,
  Building2,
  KeyRound,
  Loader2,
  LogOut,
  MailCheck,
  MailWarning,
  PencilLine,
  Power,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UserMinus,
} from "lucide-react";

import {
  changeAdminBusinessMembershipRoleAction,
  changeAdminUserGlobalRoleAction,
  changeAdminUserStatusAction,
  changeAdminUserVerificationAction,
  deleteAdminUserAction,
  removeAdminBusinessMembershipAction,
  revokeAdminUserSessionsAction,
  sendAdminPasswordResetAction,
  sendAdminVerificationEmailAction,
  unlockAdminUserAction,
  updateAdminUserProfileAction,
} from "@/app/admin/users/actions";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

const BUSINESS_ROLES = [
  ["OWNER", "Pronar"],
  ["MANAGER", "Menaxher"],
  ["MECHANIC", "Mekanik"],
  ["RECEPTIONIST", "Recepsionist"],
  ["WAREHOUSE", "Magazinier"],
  ["ACCOUNTANT", "Financier"],
];

function ActionButton({ children, onClick, disabled, tone = "secondary" }) {
  const classes = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    warning: "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes[tone]}`}>
      {children}
    </button>
  );
}

export default function UserAdminActions({ user, currentAdminId, memberships }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [globalRole, setGlobalRole] = useState(user.globalRole || "NONE");
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [membershipRoles, setMembershipRoles] = useState(() => Object.fromEntries(memberships.map((item) => [item.id, item.role])));
  const [confirmEmail, setConfirmEmail] = useState("");
  const isSelf = user.id === currentAdminId;

  function execute(action, { redirectOnDelete = false } = {}) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result?.success === false) throw new Error(result.message || "Veprimi dështoi.");
        toast.success(result?.message || "Veprimi përfundoi me sukses.");
        if (redirectOnDelete && result?.deleted) {
          router.push("/admin/users");
          router.refresh();
          return;
        }
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
      description: nextActive ? "Përdoruesi do të mund të hyjë përsëri në AutoFlow." : "Përdoruesi do të humbasë aksesin dhe sesionet aktive do të revokohen.",
      confirmLabel: nextActive ? "Aktivizo" : "Çaktivizo",
      tone: nextActive ? "warning" : "danger",
    });
    if (confirmed) execute(() => changeAdminUserStatusAction(user.id, nextActive));
  }

  async function handleRoleSave() {
    if (globalRole === (user.globalRole || "NONE")) return;
    const confirmed = await confirm({ title: "Ndrysho rolin global", description: "Ky ndryshim ndikon në portalet ku përdoruesi ka akses dhe revokon sesionet ekzistuese.", confirmLabel: "Ruaj rolin", tone: globalRole === "PLATFORM_ADMIN" ? "warning" : "danger" });
    if (confirmed) execute(() => changeAdminUserGlobalRoleAction(user.id, globalRole));
  }

  async function handleUnlock() {
    const confirmed = await confirm({ title: "Zhblloko llogarinë", description: "Tentativat e dështuara të hyrjes do të pastrohen dhe bllokimi do të hiqet.", confirmLabel: "Zhblloko", tone: "warning" });
    if (confirmed) execute(() => unlockAdminUserAction(user.id));
  }

  async function handleVerification(verified) {
    const confirmed = await confirm({
      title: verified ? "Shëno email-in si të verifikuar" : "Hiq verifikimin e email-it",
      description: verified ? "Përdore vetëm pasi ke verifikuar identitetin e përdoruesit." : "Përdoruesi do të duhet ta verifikojë sërish email-in dhe sesionet ekzistuese do të revokohen.",
      confirmLabel: verified ? "Verifiko" : "Hiq verifikimin",
      tone: verified ? "warning" : "danger",
    });
    if (confirmed) execute(() => changeAdminUserVerificationAction(user.id, verified));
  }

  async function handleRevokeSessions() {
    const confirmed = await confirm({ title: "Dil nga të gjitha pajisjet", description: "Të gjitha sesionet aktuale të përdoruesit do të bëhen të pavlefshme.", confirmLabel: "Revoko sesionet", tone: "warning" });
    if (confirmed) execute(() => revokeAdminUserSessionsAction(user.id));
  }

  async function handleMembershipRoleSave(membership) {
    const role = membershipRoles[membership.id];
    if (role === membership.role) return;
    const confirmed = await confirm({ title: "Ndrysho rolin në biznes", description: `Roli i përdoruesit te ${membership.businessName} do të ndryshojë. Sesionet do të revokohen.`, confirmLabel: "Ruaj rolin", tone: membership.role === "OWNER" ? "danger" : "warning" });
    if (confirmed) execute(() => changeAdminBusinessMembershipRoleAction(user.id, membership.id, role));
  }

  async function handleMembershipRemove(membership) {
    const confirmed = await confirm({ title: "Hiq aksesin në biznes", description: `Përdoruesi do të hiqet nga ${membership.businessName}. Pronari i fundit aktiv nuk mund të hiqet.`, confirmLabel: "Hiq aksesin", tone: "danger" });
    if (confirmed) execute(() => removeAdminBusinessMembershipAction(user.id, membership.id));
  }

  async function handleDelete() {
    if (!user.canDelete || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) return;
    const confirmed = await confirm({ title: "Fshi llogarinë përfundimisht", description: "Ky veprim nuk mund të zhbëhet. Lejohet vetëm për llogari pa të dhëna operative ose profile të lidhura.", confirmLabel: "Fshi përfundimisht", tone: "danger" });
    if (confirmed) execute(() => deleteAdminUserAction(user.id, confirmEmail), { redirectOnDelete: true });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><PencilLine size={18} /></div><div><h2 className="font-bold text-slate-950">Të dhënat bazë</h2><p className="mt-1 text-sm text-slate-500">Korrigjo emrin ose telefonin për raste support-i.</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label><span className="text-xs font-semibold text-slate-600">Emri</span><input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
          <label><span className="text-xs font-semibold text-slate-600">Telefoni</span><input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
        </div>
        <div className="mt-4"><ActionButton tone="primary" disabled={isPending || (name === user.name && phone === (user.phone || ""))} onClick={() => execute(() => updateAdminUserProfileAction(user.id, name, phone))}><Save size={16} /> Ruaj të dhënat</ActionButton></div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Power size={18} /></div><div><h2 className="font-bold text-slate-950">Statusi i llogarisë</h2><p className="mt-1 text-sm text-slate-500">Aktivizo ose pezullo aksesin e plotë të këtij përdoruesi.</p></div></div>
        <div className="mt-5"><ActionButton tone={user.isActive ? "danger" : "primary"} onClick={handleStatusChange} disabled={isPending || (isSelf && user.isActive)}>{isPending ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}{user.isActive ? "Çaktivizo përdoruesin" : "Aktivizo përdoruesin"}</ActionButton></div>
        {isSelf ? <p className="mt-2 text-xs text-slate-500">Llogaria jote nuk mund të çaktivizohet nga kjo faqe.</p> : null}
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><BadgeCheck size={18} /></div><div><h2 className="font-bold text-slate-950">Email & siguria</h2><p className="mt-1 text-sm text-slate-500">Verifikim, reset password dhe kontroll i sesioneve.</p></div></div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {user.emailVerified ? <ActionButton disabled={isPending || isSelf} onClick={() => handleVerification(false)}><MailWarning size={16} /> Hiq verifikimin</ActionButton> : <><ActionButton tone="primary" disabled={isPending} onClick={() => handleVerification(true)}><MailCheck size={16} /> Shëno të verifikuar</ActionButton><ActionButton disabled={isPending || !user.isActive} onClick={() => execute(() => sendAdminVerificationEmailAction(user.id))}><Send size={16} /> Dërgo verifikimin</ActionButton></>}
          <ActionButton disabled={isPending || !user.isActive || !user.hasPassword} onClick={() => execute(() => sendAdminPasswordResetAction(user.id))}><KeyRound size={16} /> Dërgo reset password</ActionButton>
          <ActionButton tone="warning" disabled={isPending || isSelf} onClick={handleRevokeSessions}><LogOut size={16} /> Dil nga të gjitha pajisjet</ActionButton>
          {(user.isLocked || user.failedLoginAttempts > 0) ? <ActionButton tone="warning" disabled={isPending} onClick={handleUnlock}><KeyRound size={16} /> Zhblloko / pastro tentativat</ActionButton> : null}
        </div>
        {!user.hasPassword ? <p className="mt-3 text-xs text-slate-500">Ky përdorues nuk ka password lokal; reset password nuk aplikohet për llogari vetëm me social login.</p> : null}
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ShieldCheck size={18} /></div><div><h2 className="font-bold text-slate-950">Roli global</h2><p className="mt-1 text-sm text-slate-500">I ndarë nga roli OWNER/MANAGER/MECHANIC brenda biznesit.</p></div></div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="flex-1"><span className="text-sm font-semibold text-slate-700">Aksesi global</span><select value={globalRole} onChange={(event) => setGlobalRole(event.target.value)} disabled={isPending || isSelf} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60"><option value="NONE">Pa rol global</option><option value="CUSTOMER">Customer</option><option value="PLATFORM_ADMIN">Platform Admin</option></select></label><ActionButton tone="primary" onClick={handleRoleSave} disabled={isPending || isSelf || globalRole === (user.globalRole || "NONE")}><Save size={16} /> Ruaj rolin</ActionButton></div>
      </section>

      {memberships.length ? <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Building2 size={18} /></div><div><h2 className="font-bold text-slate-950">Rolet në biznese</h2><p className="mt-1 text-sm text-slate-500">Ndryshimet mbrojnë automatikisht pronarin e fundit aktiv.</p></div></div>
        <div className="mt-5 space-y-3">{memberships.map((membership) => <div key={membership.id} className="rounded-2xl border border-slate-200 p-4"><div className="mb-3"><p className="font-semibold text-slate-900">{membership.businessName}</p><p className="text-xs text-slate-500">{membership.isActive ? "Akses aktiv" : "Akses joaktiv"}</p></div><div className="flex flex-col gap-2 sm:flex-row"><select value={membershipRoles[membership.id]} onChange={(event) => setMembershipRoles((current) => ({ ...current, [membership.id]: event.target.value }))} disabled={isPending} className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm">{BUSINESS_ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ActionButton disabled={isPending || membershipRoles[membership.id] === membership.role} onClick={() => handleMembershipRoleSave(membership)}><Save size={15} /> Ruaj</ActionButton><ActionButton tone="danger" disabled={isPending} onClick={() => handleMembershipRemove(membership)}><UserMinus size={15} /> Hiq</ActionButton></div></div>)}</div>
      </section> : null}

      <section className="rounded-[1.5rem] border border-red-200 bg-red-50/40 p-5 sm:p-6">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700"><Trash2 size={18} /></div><div><h2 className="font-bold text-red-950">Danger zone</h2><p className="mt-1 text-sm text-red-800">Fshirja e përhershme lejohet vetëm kur llogaria nuk ka të dhëna operative të lidhura.</p></div></div>
        {user.canDelete ? <div className="mt-5"><label className="block"><span className="text-xs font-semibold text-red-900">Shkruaj {user.email} për konfirmim</span><input value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-red-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-red-100" /></label><div className="mt-3"><ActionButton tone="danger" disabled={isPending || isSelf || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()} onClick={handleDelete}><Trash2 size={16} /> Fshi llogarinë</ActionButton></div></div> : <div className="mt-4 rounded-xl border border-red-100 bg-white/70 p-3"><p className="text-xs font-semibold text-red-900">Fshirja është e bllokuar:</p><ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-800">{user.deleteBlockers.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      </section>
    </div>
  );
}
