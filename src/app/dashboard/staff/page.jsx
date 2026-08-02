import StaffManager from "@/components/staff/StaffManager";
import { requireBusinessFeature } from "@/lib/business-context";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { PLAN_FEATURES } from "@/services/plan-access-service";
import { getStaffManagementData } from "@/services/staff-service";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const context = await requireBusinessFeature(PLAN_FEATURES.STAFF);
  if (!hasPermission(context.businessRole, PERMISSIONS.STAFF_VIEW)) return null;
  const data = await getStaffManagementData(context.businessId);
  return <div><div className="mb-7"><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Biznesi</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Stafi dhe rolet</h1><p className="mt-2 text-slate-500">Fto punonjës, cakto role dhe kontrollo aksesin e ekipit.</p></div><StaffManager {...data} canInvite={hasPermission(context.businessRole,PERMISSIONS.STAFF_CREATE)} canManageRoles={hasPermission(context.businessRole,PERMISSIONS.STAFF_MANAGE_ROLES)} canDisable={hasPermission(context.businessRole,PERMISSIONS.STAFF_DELETE)}/></div>;
}
