export const CUSTOMER_VEHICLE_DOCUMENT_LABELS = Object.freeze({
  INSURANCE: "Siguracion",
  TECHNICAL_INSPECTION: "Kontroll teknik",
  ROAD_TAX: "Taksa e automjetit",
  REGISTRATION_CERTIFICATE: "Leje qarkullimi",
  OWNERSHIP: "Dokument pronësie",
  OTHER: "Dokument tjetër",
});

export const CUSTOMER_VEHICLE_DOCUMENT_OPTIONS = Object.entries(
  CUSTOMER_VEHICLE_DOCUMENT_LABELS,
);

export const CUSTOMER_VEHICLE_DOCUMENT_REMINDER_DAYS = [7, 14, 30, 60, 90];
