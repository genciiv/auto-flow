import { Clock3, ShieldCheck, UserCheck, Users } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StaffManager from "@/components/staff/StaffManager";
import {
  requireBusinessFeature,
  requireBusinessPermission,
} from "@/lib/business-context";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { PLAN_FEATURES } from "@/services/plan-access-service";
import { getStaffManagementData } from "@/services/staff-service";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireBusinessPermission(PERMISSIONS.STAFF_VIEW);
  const context = await requireBusinessFeature(PLAN_FEATURES.STAFF);

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
        <div className="af-page-header">
          <div>
            <p className="af-page-eyebrow">Menaxhimi i ekipit</p>
            <h1 className="af-page-title">Stafi dhe rolet</h1>
            <p className="af-page-description">
              Fto punonj?s, cakto role dhe kontrollo aksesin e ekipit n? nj? vend.
            </p>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">
            <Users size={22} />
          </div>
        </div>

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
