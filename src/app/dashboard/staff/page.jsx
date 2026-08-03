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
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Ekipi</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Stafi dhe rolet
            </h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              Fto punonjës, cakto role dhe kontrollo aksesin e ekipit në një vend.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>
                <p className="mt-6 text-sm font-medium text-slate-500">
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
