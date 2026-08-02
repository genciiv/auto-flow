"use client";

import { useActionState } from "react";
import { LoaderCircle, MailPlus, ShieldCheck, UserRoundCheck, UserRoundX } from "lucide-react";

import { inviteStaffAction, revokeInvitationAction, toggleStaffStatusAction, updateStaffRoleAction } from "@/app/dashboard/staff/actions";
import { STAFF_ROLE_LABELS, STAFF_ROLES } from "@/config/staff";

const initialState = { success: false, message: null, error: null };

function Feedback({ state }) {
  if (!state?.message && !state?.error) return null;
  return <div className={`rounded-xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{state.message || state.error}</div>;
}

function ActionForm({ action, children }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-2"><Feedback state={state} />{children(pending)}</form>;
}

export default function StaffManager({ members, invitations, canInvite, canManageRoles, canDisable }) {
  const [inviteState, inviteAction, invitePending] = useActionState(inviteStaffAction, initialState);
  return <div className="space-y-8">
    {canInvite ? <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3"><MailPlus className="text-blue-600"/><div><h2 className="font-bold text-slate-950">Fto një punonjës</h2><p className="text-sm text-slate-500">Ftesa skadon pas 7 ditësh.</p></div></div>
      <form action={inviteAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_220px_auto]">
        <input name="email" type="email" required placeholder="punonjesi@email.com" className="h-12 rounded-xl border border-slate-200 px-4"/>
        <select name="role" className="h-12 rounded-xl border border-slate-200 px-3">{STAFF_ROLES.map(r=><option key={r} value={r}>{STAFF_ROLE_LABELS[r]}</option>)}</select>
        <button disabled={invitePending} className="h-12 rounded-xl bg-blue-600 px-5 font-semibold text-white disabled:opacity-60">{invitePending?<LoaderCircle className="animate-spin"/>:"Dërgo ftesën"}</button>
      </form><div className="mt-3"><Feedback state={inviteState}/></div>
    </section>:null}

    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6"><h2 className="font-bold text-slate-950">Ekipi ({members.length})</h2></div><div className="divide-y divide-slate-100">
      {members.map(member=><div key={member.id} className="grid gap-4 p-5 md:grid-cols-[1fr_210px_150px] md:items-center"><div><p className="font-semibold text-slate-950">{member.user.name}</p><p className="text-sm text-slate-500">{member.user.email}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${member.isActive?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{member.isActive?"Aktiv":"Joaktiv"}</span></div>
        {canManageRoles && member.role!=="OWNER"?<ActionForm action={updateStaffRoleAction}>{pending=><><input type="hidden" name="membershipId" value={member.id}/><div className="flex gap-2"><select name="role" defaultValue={member.role} className="h-10 flex-1 rounded-lg border border-slate-200 px-2">{STAFF_ROLES.map(r=><option key={r} value={r}>{STAFF_ROLE_LABELS[r]}</option>)}</select><button disabled={pending} className="rounded-lg border border-slate-200 px-3 text-sm font-semibold">Ruaj</button></div></>}</ActionForm>:<div className="text-sm font-semibold text-slate-600"><ShieldCheck className="mr-2 inline size-4"/>{STAFF_ROLE_LABELS[member.role]}</div>}
        {canDisable && member.role!=="OWNER"?<ActionForm action={toggleStaffStatusAction}>{pending=><><input type="hidden" name="membershipId" value={member.id}/><button disabled={pending} className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${member.isActive?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{member.isActive?<UserRoundX size={16}/>:<UserRoundCheck size={16}/>} {member.isActive?"Çaktivizo":"Aktivizo"}</button></>}</ActionForm>:null}
      </div>)}
    </div></section>

    {invitations.length?<section className="rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6"><h2 className="font-bold text-slate-950">Ftesa në pritje</h2></div><div className="divide-y divide-slate-100">{invitations.map(i=><div key={i.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-950">{i.email}</p><p className="text-sm text-slate-500">{STAFF_ROLE_LABELS[i.role]} · skadon më {new Date(i.expiresAt).toLocaleDateString("sq-AL")}</p></div>{canDisable?<ActionForm action={revokeInvitationAction}>{pending=><><input type="hidden" name="invitationId" value={i.id}/><button disabled={pending} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Anulo ftesën</button></>}</ActionForm>:null}</div>)}</div></section>:null}
  </div>;
}
