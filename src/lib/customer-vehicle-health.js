import { CUSTOMER_VEHICLE_MAINTENANCE_LABELS } from "@/config/customer-vehicle-maintenance";
import { getCustomerVehicleDueState } from "@/lib/customer-vehicle-maintenance";

const DAY_MS = 24 * 60 * 60 * 1000;

export const CUSTOMER_VEHICLE_HEALTH = Object.freeze({
  OK: {
    label: "Në rregull",
    description: "Nuk ka afate urgjente të identifikuara.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    panelClassName: "border-emerald-100 bg-emerald-50/40",
    priority: 1,
  },
  ATTENTION: {
    label: "Kërkon vëmendje",
    description: "Ka veprime që po afrohen ose të dhëna që duhen përditësuar.",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClassName: "border-amber-100 bg-amber-50/40",
    priority: 2,
  },
  URGENT: {
    label: "Urgjente",
    description: "Ka të paktën një afat të kaluar ose shumë pranë afatit.",
    className: "bg-red-50 text-red-700 ring-red-100",
    panelClassName: "border-red-100 bg-red-50/40",
    priority: 3,
  },
});

function startOfDay(value) {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(left, right) {
  return Math.round((startOfDay(left) - startOfDay(right)) / DAY_MS);
}

function severityFromDueState(dueState) {
  if (["OVERDUE", "DUE"].includes(dueState.status)) return "URGENT";
  if (dueState.status === "SOON") return "ATTENTION";
  return "OK";
}

function makeAction({ key, severity, title, detail, href, kind }) {
  return { key, severity, title, detail, href, kind };
}

function latestMaintenanceByType(records = []) {
  const seen = new Set();

  return records.filter((record) => {
    if (seen.has(record.type)) return false;
    seen.add(record.type);
    return true;
  });
}

export function getCustomerVehicleHealth({
  vehicleId,
  mileage = null,
  latestMileageAt = null,
  maintenanceHistory = [],
  reminders = [],
  documents = [],
  expenses = [],
  expenseSummary12Months = null,
  serviceCount = 0,
  now = new Date(),
}) {
  const actions = [];
  const latestMaintenance = latestMaintenanceByType(maintenanceHistory);

  for (const item of latestMaintenance) {
    const dueState = getCustomerVehicleDueState({
      currentMileage: mileage,
      nextMileage: item.nextMileage ?? null,
      nextDate: item.nextDate ?? null,
      now,
    });
    const severity = severityFromDueState(dueState);

    if (severity !== "OK") {
      actions.push(
        makeAction({
          key: `maintenance:${item.id}`,
          severity,
          kind: "MAINTENANCE",
          title: CUSTOMER_VEHICLE_MAINTENANCE_LABELS[item.type] || item.title,
          detail: dueState.text,
          href: `/customer/vehicles/${vehicleId}#mirembajtja`,
        }),
      );
    }
  }

  for (const reminder of reminders.filter((item) => !item.documentId)) {
    const dueState = getCustomerVehicleDueState({
      currentMileage: mileage,
      nextMileage: reminder.dueMileage ?? null,
      nextDate: reminder.dueDate ?? null,
      now,
    });
    const severity = severityFromDueState(dueState);

    if (severity !== "OK") {
      actions.push(
        makeAction({
          key: `reminder:${reminder.id}`,
          severity,
          kind: "REMINDER",
          title: reminder.title,
          detail: dueState.text,
          href: `/customer/vehicles/${vehicleId}#mirembajtja`,
        }),
      );
    }
  }

  for (const document of documents) {
    if (!document.expiresAt) continue;

    const daysRemaining = daysBetween(document.expiresAt, now);
    let severity = "OK";
    let detail = null;

    if (daysRemaining < 0) {
      severity = "URGENT";
      detail = `Ka skaduar prej ${Math.abs(daysRemaining)} ditësh`;
    } else if (daysRemaining <= 7) {
      severity = "URGENT";
      detail = daysRemaining === 0 ? "Skadon sot" : `Skadon pas ${daysRemaining} ditësh`;
    } else if (daysRemaining <= 30) {
      severity = "ATTENTION";
      detail = `Skadon pas ${daysRemaining} ditësh`;
    }

    if (severity !== "OK") {
      actions.push(
        makeAction({
          key: `document:${document.id}`,
          severity,
          kind: "DOCUMENT",
          title: document.title,
          detail,
          href: `/customer/vehicles/${vehicleId}#documents`,
        }),
      );
    }
  }

  if (mileage === null || mileage === undefined) {
    actions.push(
      makeAction({
        key: "mileage:missing",
        severity: "ATTENTION",
        kind: "MILEAGE",
        title: "Regjistro kilometrazhin aktual",
        detail: "Kilometrazhi ndihmon AutoFlow të llogarisë afatet e mirëmbajtjes.",
        href: `/customer/vehicles/${vehicleId}#historiku`,
      }),
    );
  } else if (latestMileageAt && daysBetween(now, latestMileageAt) >= 120) {
    actions.push(
      makeAction({
        key: "mileage:stale",
        severity: "ATTENTION",
        kind: "MILEAGE",
        title: "Përditëso kilometrazhin",
        detail: "Kilometrazhi nuk është përditësuar prej të paktën 120 ditësh.",
        href: `/customer/vehicles/${vehicleId}#historiku`,
      }),
    );
  }

  actions.sort((left, right) => {
    const priority = CUSTOMER_VEHICLE_HEALTH[right.severity].priority - CUSTOMER_VEHICLE_HEALTH[left.severity].priority;
    if (priority !== 0) return priority;
    return left.title.localeCompare(right.title, "sq");
  });

  const status = actions.some((action) => action.severity === "URGENT")
    ? "URGENT"
    : actions.some((action) => action.severity === "ATTENTION")
      ? "ATTENTION"
      : "OK";

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  const expensesLast12Months = expenses.filter(
    (expense) => new Date(expense.occurredAt) >= twelveMonthsAgo,
  );
  const derivedExpenseTotal12Months = expensesLast12Months.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const expenseTotal12Months = expenseSummary12Months
    ? Number(expenseSummary12Months.total || 0)
    : derivedExpenseTotal12Months;
  const expenseCount12Months = expenseSummary12Months
    ? Number(expenseSummary12Months.count || 0)
    : expensesLast12Months.length;
  const expiringDocuments = documents.filter((document) => {
    if (!document.expiresAt) return false;
    const days = daysBetween(document.expiresAt, now);
    return days >= 0 && days <= 30;
  }).length;
  const expiredDocuments = documents.filter(
    (document) => document.expiresAt && daysBetween(document.expiresAt, now) < 0,
  ).length;

  return {
    status,
    ...CUSTOMER_VEHICLE_HEALTH[status],
    actions: actions.slice(0, 5),
    actionCount: actions.length,
    metrics: {
      expenseTotal12Months,
      expenseCount12Months,
      documentCount: documents.length,
      expiringDocuments,
      expiredDocuments,
      serviceCount,
      maintenanceTracked: latestMaintenance.length,
    },
  };
}
