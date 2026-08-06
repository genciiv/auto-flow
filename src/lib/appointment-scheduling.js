import { createActionError } from "@/lib/errors";

const MAX_APPOINTMENT_DURATION_MINUTES = 720;
const NON_BLOCKING_APPOINTMENT_STATUSES = ["CANCELLED", "NO_SHOW"];
const SERIALIZABLE_RETRY_CODES = new Set(["P2034"]);

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function getAppointmentWindow(date, durationMinutes) {
  const start = new Date(date);
  const end = addMinutes(start, durationMinutes);

  return { start, end };
}

export async function findAppointmentConflict({
  database,
  businessId,
  assignedUserId,
  date,
  durationMinutes,
  excludeAppointmentId = null,
}) {
  if (!assignedUserId) {
    return null;
  }

  const { start, end } = getAppointmentWindow(date, durationMinutes);
  const earliestPossibleStart = addMinutes(
    start,
    -MAX_APPOINTMENT_DURATION_MINUTES,
  );

  const candidates = await database.appointment.findMany({
    where: {
      businessId,
      assignedUserId,
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      status: { notIn: NON_BLOCKING_APPOINTMENT_STATUSES },
      date: {
        gte: earliestPossibleStart,
        lt: end,
      },
    },
    select: {
      id: true,
      title: true,
      date: true,
      durationMinutes: true,
    },
    orderBy: { date: "asc" },
  });

  return (
    candidates.find((candidate) => {
      const candidateEnd = addMinutes(
        candidate.date,
        candidate.durationMinutes,
      );

      return candidate.date < end && candidateEnd > start;
    }) || null
  );
}

export async function assertAppointmentSlotAvailable(options) {
  const conflict = await findAppointmentConflict(options);

  if (!conflict) {
    return;
  }

  const conflictTime = new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Tirane",
  }).format(conflict.date);

  throw createActionError(
    `Punonjësi ka një termin tjetër që mbivendoset (${conflict.title}, ${conflictTime}).`,
  );
}

export async function runSerializableAppointmentTransaction(
  database,
  operation,
  { maxAttempts = 3 } = {},
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await database.$transaction(operation, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      lastError = error;

      if (!SERIALIZABLE_RETRY_CODES.has(error?.code) || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw lastError;
}
