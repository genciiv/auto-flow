import { APP_TIME_ZONE } from "@/lib/date-time";

const DAY_MS = 24 * 60 * 60 * 1000;

export const CUSTOMER_VEHICLE_DUE_STATUS = Object.freeze({
  NONE: {
    label: "Pa afat",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    priority: 0,
  },
  OK: {
    label: "Në rregull",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    priority: 1,
  },
  SOON: {
    label: "Afër afatit",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    priority: 2,
  },
  DUE: {
    label: "Duhet kryer",
    className: "bg-orange-50 text-orange-700 ring-orange-100",
    priority: 3,
  },
  OVERDUE: {
    label: "Ka kaluar afati",
    className: "bg-red-50 text-red-700 ring-red-100",
    priority: 4,
  },
});

function dateKey(value) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value instanceof Date ? value : new Date(value));
}

function dateKeyToUtc(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getDateStatus(nextDate, now) {
  if (!nextDate) return null;

  const dueKey = dateKey(nextDate);
  const todayKey = dateKey(now);
  const daysRemaining = Math.round(
    (dateKeyToUtc(dueKey) - dateKeyToUtc(todayKey)) / DAY_MS,
  );

  if (daysRemaining < 0) {
    return {
      status: "OVERDUE",
      daysRemaining,
      text: `Ka kaluar me ${Math.abs(daysRemaining)} ditë`,
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: "DUE",
      daysRemaining,
      text:
        daysRemaining === 0
          ? "Afati është sot"
          : `Afati është pas ${daysRemaining} ditësh`,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "SOON",
      daysRemaining,
      text: `Afati është pas ${daysRemaining} ditësh`,
    };
  }

  return {
    status: "OK",
    daysRemaining,
    text: `Afati është pas ${daysRemaining} ditësh`,
  };
}

function getMileageStatus(nextMileage, currentMileage) {
  if (
    nextMileage === null ||
    nextMileage === undefined ||
    currentMileage === null ||
    currentMileage === undefined
  ) {
    return null;
  }

  const kilometersRemaining = nextMileage - currentMileage;

  if (kilometersRemaining < 0) {
    return {
      status: "OVERDUE",
      kilometersRemaining,
      text: `Ka kaluar me ${Math.abs(kilometersRemaining).toLocaleString("sq-AL")} km`,
    };
  }

  if (kilometersRemaining <= 250) {
    return {
      status: "DUE",
      kilometersRemaining,
      text:
        kilometersRemaining === 0
          ? "Afati kilometrik është arritur"
          : `${kilometersRemaining.toLocaleString("sq-AL")} km të mbetura`,
    };
  }

  if (kilometersRemaining <= 1000) {
    return {
      status: "SOON",
      kilometersRemaining,
      text: `${kilometersRemaining.toLocaleString("sq-AL")} km të mbetura`,
    };
  }

  return {
    status: "OK",
    kilometersRemaining,
    text: `${kilometersRemaining.toLocaleString("sq-AL")} km të mbetura`,
  };
}

export function getCustomerVehicleDueState({
  currentMileage = null,
  nextMileage = null,
  nextDate = null,
  now = new Date(),
}) {
  const checks = [
    getMileageStatus(nextMileage, currentMileage),
    getDateStatus(nextDate, now),
  ].filter(Boolean);

  if (!checks.length) {
    return {
      status: "NONE",
      ...CUSTOMER_VEHICLE_DUE_STATUS.NONE,
      text: "Nuk është vendosur afat i ardhshëm.",
    };
  }

  const selected = checks.reduce((mostImportant, current) => {
    if (!mostImportant) return current;

    return CUSTOMER_VEHICLE_DUE_STATUS[current.status].priority >
      CUSTOMER_VEHICLE_DUE_STATUS[mostImportant.status].priority
      ? current
      : mostImportant;
  }, null);

  return {
    ...selected,
    ...CUSTOMER_VEHICLE_DUE_STATUS[selected.status],
  };
}

export function getMostUrgentVehicleDueItem(items, currentMileage = null) {
  return items
    .map((item) => ({
      ...item,
      dueState: getCustomerVehicleDueState({
        currentMileage,
        nextMileage: item.nextMileage ?? item.dueMileage ?? null,
        nextDate: item.nextDate ?? item.dueDate ?? null,
      }),
    }))
    .filter((item) => item.dueState.status !== "NONE")
    .sort((left, right) => {
      const priorityDiff = right.dueState.priority - left.dueState.priority;

      if (priorityDiff !== 0) return priorityDiff;

      const leftDate = left.nextDate ?? left.dueDate;
      const rightDate = right.nextDate ?? right.dueDate;

      if (leftDate && rightDate) {
        return new Date(leftDate) - new Date(rightDate);
      }

      const leftMileage = left.nextMileage ?? left.dueMileage;
      const rightMileage = right.nextMileage ?? right.dueMileage;

      if (leftMileage !== null && leftMileage !== undefined && rightMileage !== null && rightMileage !== undefined) {
        return leftMileage - rightMileage;
      }

      return 0;
    })[0] ?? null;
}
