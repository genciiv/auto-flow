import { Clock3, ShieldCheck, UserCheck, Users } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StaffManager from "@/components/staff/StaffManager";
import { requireBusinessFeature } from "@/lib/business-context";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { PLAN_FEATURES } from "@/services/plan-access-service";
import { getStaffManagementData } from "@/services/staff-service";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const context = await requireBusinessFeature(PLAN_FEATURES.STAFF);

  if (!hasPermission(context.businessRole, PERMISSIONS.STAFF_VIEW)) {
    return null;
  }

  const data = await getStaffManagementData(context.businessId);
  const activeMembers = data.members.filter((member) => member.isActive).length;
  const inactiveMembers = data.members.length - activeMembers;

  const stats = [
    {
      label: "Anëtarë gjithsej",
      value: data.members.length,
      icon: Users,
    },
    {
      label: "Aktivë",
      value: activeMembers,
      icon: UserCheck,
    },
    {
      label: "Joaktivë",
      value: inactiveMembers,
      icon: ShieldCheck,
    },
    {
      label: "Ftesa në pritje",
      value: data.invitations.length,
      icon: Clock3,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <Users size={14} />
              Menaxhimi i ekipit
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Stafi dhe rolet
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Fto punonjës, cakto role dhe kontrollo aksesin e ekipit në një vend.
            </p>
          </div>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>
                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <StaffManager
          {...data}
          canInvite={hasPermission(
            context.businessRole,
            PERMISSIONS.STAFF_CREATE,
          )}
          canManageRoles={hasPermission(
            context.businessRole,
            PERMISSIONS.STAFF_MANAGE_ROLES,
          )}
          canDisable={hasPermission(
            context.businessRole,
            PERMISSIONS.STAFF_DELETE,
          )}
        />
      </div>
    </DashboardLayout>
  );
}
