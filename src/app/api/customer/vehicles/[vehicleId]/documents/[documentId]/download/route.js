import { auth } from "@/auth";
import { apiError, apiFailure } from "@/lib/api-response";
import { db } from "@/lib/db";
import { ERROR_CODES } from "@/lib/errors";
import { getRequestId } from "@/lib/request-context";
import { getCustomerVehicleDocumentStorage } from "@/lib/customer-vehicle-document-storage";

export async function GET(request, { params }) {
  const requestId = getRequestId(request);

  try {
    const session = await auth();

    if (!session?.user?.id || session.user.globalRole !== "CUSTOMER") {
      return apiFailure({
        code: ERROR_CODES.UNAUTHENTICATED,
        message: "Duhet të identifikohesh si klient.",
        status: 401,
        requestId,
      });
    }

    const { vehicleId, documentId } = await params;
    const document = await db.customerVehicleDocument.findFirst({
      where: {
        id: documentId,
        customerVehicleId: vehicleId,
        customerVehicle: {
          profile: {
            userId: session.user.id,
          },
        },
      },
      select: {
        storagePath: true,
        fileName: true,
      },
    });

    if (!document) {
      return apiFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Dokumenti nuk u gjet.",
        status: 404,
        requestId,
      });
    }

    let storage;

    try {
      storage = await getCustomerVehicleDocumentStorage();
    } catch {
      return apiFailure({
        code: ERROR_CODES.STORAGE_ERROR,
        message: "Shërbimi i dokumenteve nuk është i disponueshëm.",
        status: 503,
        requestId,
      });
    }

    const { data, error } = await storage.supabase.storage
      .from(storage.bucket)
      .createSignedUrl(document.storagePath, 60, {
        download: document.fileName,
      });

    if (error || !data?.signedUrl) {
      return apiFailure({
        code: ERROR_CODES.STORAGE_ERROR,
        message: "Dokumenti nuk mund të shkarkohet për momentin.",
        status: 502,
        requestId,
      });
    }

    return Response.redirect(data.signedUrl, 302);
  } catch (error) {
    return apiError(error, {
      request,
      requestId,
      fallbackMessage: "Dokumenti nuk mund të shkarkohet për momentin.",
    });
  }
}
