import { createActionError } from "@/lib/errors";

const CLOSED_SERVICE_STATUSES = new Set([
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
]);

export function assertServiceBillingEditable(service) {
  if (!service) {
    throw createActionError("Shërbimi nuk u gjet.");
  }

  if (service.invoice) {
    throw createActionError(
      `Shërbimi ka faturën ${service.invoice.number}. Punët dhe pjesët nuk mund të ndryshohen pas faturimit.`,
    );
  }

  if (CLOSED_SERVICE_STATUSES.has(service.status)) {
    throw createActionError(
      "Shërbimi është mbyllur dhe nuk mund të ndryshohet.",
    );
  }

  return service;
}
