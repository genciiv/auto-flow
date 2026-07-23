export const MAINTENANCE_TYPES = [
  { value: "ENGINE_OIL", label: "Vaj motori" },
  { value: "OIL_FILTER", label: "Filtër vaji" },
  { value: "AIR_FILTER", label: "Filtër ajri" },
  { value: "CABIN_FILTER", label: "Filtër kabine" },
  { value: "FUEL_FILTER", label: "Filtër karburanti" },
  { value: "BRAKE_FLUID", label: "Lëng frenash" },
  { value: "COOLANT", label: "Antifriz" },
  { value: "TIMING_BELT", label: "Rrip faze" },
  { value: "GEARBOX_OIL", label: "Vaj kambjoje" },
  { value: "BRAKES", label: "Frena" },
  { value: "BATTERY", label: "Bateri" },
  { value: "TIRES", label: "Goma" },
  { value: "SPARK_PLUGS", label: "Kandele" },
  { value: "OTHER", label: "Tjetër" },
];

export function getMaintenanceTypeLabel(type) {
  return (
    MAINTENANCE_TYPES.find((item) => item.value === type)?.label ||
    "Mirëmbajtje"
  );
}

export function calculateMaintenanceStatus({
  currentMileage,
  nextMileage,
  nextDate,
}) {
  const today = new Date();
  const dueDate = nextDate ? new Date(nextDate) : null;

  const mileageRemaining =
    Number.isFinite(currentMileage) && Number.isFinite(nextMileage)
      ? nextMileage - currentMileage
      : null;

  const daysRemaining = dueDate
    ? Math.ceil((dueDate.getTime() - today.getTime()) / 86400000)
    : null;

  if (
    (mileageRemaining !== null && mileageRemaining <= 0) ||
    (daysRemaining !== null && daysRemaining <= 0)
  ) {
    return "OVERDUE";
  }

  if (
    (mileageRemaining !== null && mileageRemaining <= 1000) ||
    (daysRemaining !== null && daysRemaining <= 30)
  ) {
    return "SOON";
  }

  return "OK";
}
