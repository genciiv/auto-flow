export const CUSTOMER_VEHICLE_MAINTENANCE_LABELS = Object.freeze({
  ENGINE_OIL: "Vaj motori",
  OIL_FILTER: "Filtër vaji",
  AIR_FILTER: "Filtër ajri",
  CABIN_FILTER: "Filtër kabine",
  FUEL_FILTER: "Filtër karburanti",
  BRAKE_FLUID: "Lëng frenash",
  COOLANT: "Lëng ftohës",
  TIMING_BELT: "Rrip faze",
  GEARBOX_OIL: "Vaj kambios",
  BRAKES: "Frenat",
  BATTERY: "Bateria",
  TIRES: "Gomat",
  SPARK_PLUGS: "Kandelat",
  OTHER: "Mirëmbajtje tjetër",
});

export const CUSTOMER_VEHICLE_MAINTENANCE_OPTIONS = Object.entries(
  CUSTOMER_VEHICLE_MAINTENANCE_LABELS,
);

export const CUSTOMER_VEHICLE_REMINDER_LABELS = Object.freeze({
  INSURANCE: "Siguracioni",
  TECHNICAL_INSPECTION: "Kontrolli teknik",
  ROAD_TAX: "Taksa e automjetit",
  CUSTOM: "Kujtesë tjetër",
});

export const CUSTOMER_VEHICLE_REMINDER_OPTIONS = Object.entries(
  CUSTOMER_VEHICLE_REMINDER_LABELS,
);
