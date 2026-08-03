"use client";

import { useActionState } from "react";
import {
  Clock3,
  LoaderCircle,
  MailPlus,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import {
  inviteStaffAction,
  revokeInvitationAction,
  toggleStaffStatusAction,
  updateStaffRoleAction,
} from "@/app/dashboard/staff/actions";
import { STAFF_ROLE_LABELS, STAFF_ROLES } from "@/config/staff";

const initialState = {
  success: false,
  message: null,
  error: null,
};

function Feedback({ state }) {
  if (!state?.message && !state?.error) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        state.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.message || state.error}
    </div>
  );
}

function ActionForm({ action, children }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <Feedback state={state} />
      {children(pending)}
    </form>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getInitials(name, email) {
  const source = String(name || email || "U").trim();

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function StaffManager({
  members,
  invitations,
  canInvite,
  canManageRoles,
  canDisable,
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteStaffAction,
    initialState,
  );

  return (
    <div className="space-y-8">
      {canInvite ? (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MailPlus size={21} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Fto një punonjës
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ftesa dërgohet me email dhe skadon pas 7 ditësh.
                </p>
              </div>
            </div>
          </div>

          <form
            action={inviteAction}
            className="grid gap-4 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end"
          >
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Email-i i punonjësit
              </span>
              <input
                name="email"
                type="email"
                required
                placeholder="punonjesi@email.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Roli</span>
              <select
                name="role"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {STAFF_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>

            <button
              disabled={invitePending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {invitePending ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Duke dërguar...
                </>
              ) : (
                "Dërgo ftesën"
              )}
            </button>
          </form>

          <div className="px-6 pb-6">
            <Feedback state={inviteState} />
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Ekipi i biznesit
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {members.length} {members.length === 1 ? "anëtar" : "anëtarë"} në ekip.
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Users size={22} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Nuk ka ende anëtarë stafi
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Përdor formularin më sipër për të ftuar anëtarin e parë të ekipit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Punonjësi</th>
                  <th className="px-6 py-4">Roli</th>
                  <th className="px-6 py-4">Statusi</th>
                  <th className="px-6 py-4">Hyrja e fundit</th>
                  <th className="px-6 py-4 text-right">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="align-middle hover:bg-slate-50/60">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-700">
                          {getInitials(member.user.name, member.user.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {member.user.name || "Pa emër"}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {canManageRoles && member.role !== "OWNER" ? (
                        <ActionForm action={updateStaffRoleAction}>
                          {(pending) => (
                            <div className="flex min-w-[210px] items-center gap-2">
                              <input
                                type="hidden"
                                name="membershipId"
                                value={member.id}
                              />
                              <select
                                name="role"
                                defaultValue={member.role}
                                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                              >
                                {STAFF_ROLES.map((role) => (
                                  <option key={role} value={role}>
                                    {STAFF_ROLE_LABELS[role]}
                                  </option>
                                ))}
                              </select>
                              <button
                                disabled={pending}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                              >
                                Ruaj
                              </button>
                            </div>
                          )}
                        </ActionForm>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <ShieldCheck size={16} className="text-blue-600" />
                          {STAFF_ROLE_LABELS[member.role]}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {member.isActive ? "Aktiv" : "Joaktiv"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(member.user.lastLoginAt)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      {canDisable && member.role !== "OWNER" ? (
                        <ActionForm action={toggleStaffStatusAction}>
                          {(pending) => (
                            <>
                              <input
                                type="hidden"
                                name="membershipId"
                                value={member.id}
                              />
                              <button
                                disabled={pending}
                                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition disabled:opacity-60 ${
                                  member.isActive
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {member.isActive ? (
                                  <UserRoundX size={16} />
                                ) : (
                                  <UserRoundCheck size={16} />
                                )}
                                {member.isActive ? "Çaktivizo" : "Aktivizo"}
                              </button>
                            </>
                          )}
                        </ActionForm>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {invitations.length > 0 ? (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock3 size={19} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Ftesa në pritje
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ftesat e papranuara ose të paanuluara.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {invitation.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {STAFF_ROLE_LABELS[invitation.role]} · skadon më{" "}
                    {formatDate(invitation.expiresAt)}
                  </p>
                </div>

                {canDisable ? (
                  <ActionForm action={revokeInvitationAction}>
                    {(pending) => (
                      <>
                        <input
                          type="hidden"
                          name="invitationId"
                          value={invitation.id}
                        />
                        <button
                          disabled={pending}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                        >
                          Anulo ftesën
                        </button>
                      </>
                    )}
                  </ActionForm>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
