import { createActionError } from "@/lib/errors";

export const SERVICE_WORKFLOW_STATUSES = [
  "DRAFT",
  "PENDING",
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
];

export const SERVICE_STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING: "Në pritje",
  IN_PROGRESS: "Në proces",
  WAITING_FOR_PARTS: "Në pritje të pjesëve",
  READY_FOR_PICKUP: "Gati për dorëzim",
  COMPLETED: "Përfunduar",
  DELIVERED: "Dorëzuar",
  CANCELLED: "Anuluar",
};

export const SERVICE_STATUS_TRANSITIONS = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_PARTS", "READY_FOR_PICKUP", "CANCELLED"],
  WAITING_FOR_PARTS: ["IN_PROGRESS", "READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["IN_PROGRESS", "COMPLETED"],
  COMPLETED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const SERIALIZABLE_RETRY_CODES = new Set(["P2034", "P2028"]);

export function assertServiceTransitionAllowed(fromStatus, toStatus) {
  if (fromStatus === toStatus) {
    return;
  }

  if (!SERVICE_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus)) {
    throw createActionError(
      `Kalimi nga “${SERVICE_STATUS_LABELS[fromStatus] || fromStatus}” në “${
        SERVICE_STATUS_LABELS[toStatus] || toStatus
      }” nuk lejohet.`,
    );
  }
}

export function assertServiceReadyToClose(service, targetStatus) {
  if (!["READY_FOR_PICKUP", "COMPLETED", "DELIVERED"].includes(targetStatus)) {
    return;
  }

  if (!service.diagnosis?.trim()) {
    throw createActionError(
      "Regjistro diagnozën para se urdhër-puna të bëhet gati për dorëzim.",
    );
  }

  const laborCount = service._count?.laborItems || 0;
  const partCount = service._count?.partsUsed || 0;

  if (laborCount + partCount === 0) {
    throw createActionError(
      "Regjistro të paktën një punë ose pjesë para mbylljes së urdhër-punës.",
    );
  }

  if (targetStatus === "DELIVERED" && service.status !== "COMPLETED") {
    throw createActionError(
      "Automjeti mund të dorëzohet vetëm pasi servisi të jetë përfunduar.",
    );
  }
}

export function getServiceTransitionTimestamps(service, targetStatus, now) {
  const timestamps = {};

  if (targetStatus === "IN_PROGRESS" && !service.startedAt) {
    timestamps.startedAt = now;
  }

  if (targetStatus === "READY_FOR_PICKUP" && !service.readyAt) {
    timestamps.readyAt = now;
  }

  if (targetStatus === "COMPLETED" && !service.completedAt) {
    timestamps.completedAt = now;
  }

  if (targetStatus === "DELIVERED" && !service.deliveredAt) {
    timestamps.deliveredAt = now;
  }

  return timestamps;
}

export async function runSerializableServiceWorkflow(database, operation) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await database.$transaction(operation, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      if (
        attempt === maxAttempts ||
        !SERIALIZABLE_RETRY_CODES.has(error?.code)
      ) {
        throw error;
      }
    }
  }

  throw createActionError("Ndryshimi i statusit nuk mund të përfundohej.");
}
