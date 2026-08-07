import { z } from "zod";
import { normalizeTrimmedString } from "./common-schema";

export const CUSTOMER_VEHICLE_DOCUMENT_TYPES = [
  "INSURANCE",
  "TECHNICAL_INSPECTION",
  "ROAD_TAX",
  "REGISTRATION_CERTIFICATE",
  "OWNERSHIP",
  "OTHER",
];

const clean = (value) => normalizeTrimmedString(value);
const optional = (value) => clean(value) || null;
const validDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const createCustomerVehicleDocumentSchema = z.object({
  vehicleId: z.preprocess(clean, z.string().min(1, "Automjeti nuk u identifikua.")),
  type: z.preprocess((v) => clean(v).toUpperCase(), z.enum(CUSTOMER_VEHICLE_DOCUMENT_TYPES)),
  title: z.preprocess(optional, z.string().max(120).nullable()),
  issuedAt: z.preprocess(optional, z.string().refine(validDateOnly, "Data nuk është e vlefshme.").nullable()),
  expiresAt: z.preprocess(optional, z.string().refine(validDateOnly, "Data nuk është e vlefshme.").nullable()),
  remindDaysBefore: z.preprocess((v) => Number(clean(v) || 30), z.number().int().min(1).max(180)),
  notes: z.preprocess(optional, z.string().max(1000).nullable()),
}).superRefine((data, ctx) => {
  if (data.issuedAt && data.expiresAt && data.expiresAt < data.issuedAt) {
    ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Skadimi nuk mund të jetë para datës së lëshimit." });
  }
  if (data.type === "OTHER" && !data.title) {
    ctx.addIssue({ code: "custom", path: ["title"], message: "Vendos titullin e dokumentit." });
  }
});

export const deleteCustomerVehicleDocumentSchema = z.object({
  vehicleId: z.string().min(1),
  documentId: z.string().min(1),
});

export function parseDocumentDate(value) {
  return value ? new Date(`${value}T12:00:00.000Z`) : null;
}
