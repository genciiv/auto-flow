import { randomUUID } from "node:crypto";
import { CUSTOMER_VEHICLE_DOCUMENT_LABELS } from "@/config/customer-vehicle-documents";
import { db } from "@/lib/db";
import { createActionError, createNotFoundError, ERROR_CODES } from "@/lib/errors";
import { getCustomerVehicleDocumentStorage } from "@/lib/customer-vehicle-document-storage";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

function reminderType(type) {
  if (["INSURANCE", "TECHNICAL_INSPECTION", "ROAD_TAX"].includes(type)) return type;
  return "CUSTOM";
}

function extensionForMime(mime) {
  return { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[mime] || "bin";
}

async function validateFile(file) {
  if (!file || typeof file.arrayBuffer !== "function" || !Number.isFinite(file.size) || file.size < 1) {
    throw createActionError("Zgjidh dokumentin që do të ngarkosh.", { code: ERROR_CODES.VALIDATION_ERROR, status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    throw createActionError("Dokumenti nuk mund të kalojë 10 MB.", { code: ERROR_CODES.VALIDATION_ERROR, status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw createActionError("Lejohen vetëm PDF, JPG, PNG ose WEBP.", { code: ERROR_CODES.VALIDATION_ERROR, status: 400 });
  }
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const pdf = bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46;
  const jpg = bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  const png = bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47;
  const webp = String.fromCharCode(...bytes.slice(0,4))==="RIFF" && String.fromCharCode(...bytes.slice(8,12))==="WEBP";
  if (!({"application/pdf":pdf,"image/jpeg":jpg,"image/png":png,"image/webp":webp}[file.type])) {
    throw createActionError("Përmbajtja e skedarit nuk përputhet me formatin e deklaruar.", { code: ERROR_CODES.VALIDATION_ERROR, status: 400 });
  }
}

export async function createCustomerVehicleDocument({ profileId, vehicleId, type, title, issuedAt, expiresAt, remindDaysBefore, notes, file }) {
  const vehicle = await db.customerVehicle.findFirst({ where: { id: vehicleId, profileId }, select: { id: true } });
  if (!vehicle) throw createNotFoundError("Automjeti nuk u gjet ose nuk keni leje për këtë veprim.");
  await validateFile(file);

  const { supabase, bucket } = await getCustomerVehicleDocumentStorage();
  const path = `customer-vehicles/${profileId}/${vehicleId}/${randomUUID()}.${extensionForMime(file.type)}`;
  const upload = await supabase.storage.from(bucket).upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (upload.error) throw createActionError("Dokumenti nuk mund të ngarkohej në storage.", { code: ERROR_CODES.STORAGE_ERROR, status: 500 });

  try {
    return await db.$transaction(async (tx) => {
      const document = await tx.customerVehicleDocument.create({ data: {
        customerVehicleId: vehicleId,
        type,
        title: title || CUSTOMER_VEHICLE_DOCUMENT_LABELS[type] || "Dokument automjeti",
        fileName: file.name.slice(0, 255), storagePath: path, mimeType: file.type, sizeBytes: file.size,
        issuedAt, expiresAt, notes,
      }});
      if (expiresAt) {
        await tx.customerVehicleReminder.create({ data: {
          customerVehicleId: vehicleId,
          documentId: document.id,
          type: reminderType(type),
          title: `${document.title} – skadimi`,
          dueDate: expiresAt,
          remindDaysBefore,
          notes: "Krijuar automatikisht nga dokumenti i automjetit.",
        }});
      }
      return document;
    });
  } catch (error) {
    await supabase.storage.from(bucket).remove([path]);
    throw error;
  }
}

export async function deleteCustomerVehicleDocument({ profileId, vehicleId, documentId }) {
  const document = await db.customerVehicleDocument.findFirst({
    where: { id: documentId, customerVehicleId: vehicleId, customerVehicle: { profileId } },
    select: { id: true, storagePath: true },
  });
  if (!document) throw createNotFoundError("Dokumenti nuk u gjet ose nuk keni leje ta fshini.");
  const { supabase, bucket } = await getCustomerVehicleDocumentStorage();
  const removal = await supabase.storage.from(bucket).remove([document.storagePath]);
  if (removal.error) throw createActionError("Skedari nuk mund të fshihej nga storage.", { code: ERROR_CODES.STORAGE_ERROR, status: 500 });
  await db.customerVehicleDocument.delete({ where: { id: document.id } });
  return document;
}
