import { apiError } from "@/lib/api-response";
import { requireBusinessPermission } from "@/lib/business-context";
import { PERMISSIONS } from "@/lib/permissions";
import { getRequestId } from "@/lib/request-context";
import { buildBusinessDataExport } from "@/services/business-data-export-service";
import { createAuditLog } from "@/services/audit-log-service";

function safeFilePart(value) {
  return String(value || "business")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "business";
}

export async function GET(request) {
  const requestId = getRequestId(request);
  try {
    const context = await requireBusinessPermission(PERMISSIONS.SETTINGS_UPDATE);
    const generatedAt = new Date();
    const payload = await buildBusinessDataExport(context.businessId, { generatedAt });

    await createAuditLog({
      businessId: context.businessId,
      userId: context.userId,
      action: "EXPORT",
      entityType: "BUSINESS_DATA",
      entityId: context.businessId,
      title: "Eksport i të dhënave të biznesit",
      description: "U krijua një eksport JSON i të dhënave të biznesit.",
      metadata: { requestId, generatedAt: generatedAt.toISOString(), formatVersion: 1 },
    });

    const filename = `autoflow-${safeFilePart(context.business?.name)}-${generatedAt.toISOString().slice(0, 10)}.json`;
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store, private",
        "x-content-type-options": "nosniff",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    return apiError(error, { request, requestId, fallbackMessage: "Eksporti i të dhënave dështoi." });
  }
}
