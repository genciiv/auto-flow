const ENTITY_LABELS = {
  CUSTOMER: "Klient",
  VEHICLE: "Automjet",
  SERVICE: "Shërbim",
  SERVICE_RECORD: "Shërbim",
  INVOICE: "Faturë",
  PAYMENT: "Pagesë",
  MARKETPLACE: "Marketplace",
  MARKETPLACE_LISTING: "Produkt Marketplace",
  APPOINTMENT: "Termin",
  BUSINESS: "Biznes",
  PURCHASE_ORDER: "Porosi",
  PURCHASE_ITEM: "Artikull porosie",
  INVENTORY: "Inventar",
  PART: "Pjesë",
  STOCK_MOVEMENT: "Lëvizje stoku",
  USER: "Përdorues",
  STAFF: "Staf",
  DOCUMENT: "Dokument",
  SYSTEM: "Sistem",
};

function formatFallbackLabel(entityType) {
  return String(entityType || "ENTITY")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getAuditEntityLabel(entityType) {
  return ENTITY_LABELS[entityType] || formatFallbackLabel(entityType);
}

export default function AuditEntityBadge({ entityType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      {getAuditEntityLabel(entityType)}
    </span>
  );
}
