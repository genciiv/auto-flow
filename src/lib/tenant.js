export function tenantWhere(businessId, where = {}) {
  if (!businessId) {
    throw new Error("Business ID mungon.");
  }

  return {
    ...where,
    businessId,
  };
}

export function tenantData(businessId, data = {}) {
  if (!businessId) {
    throw new Error("Business ID mungon.");
  }

  return {
    ...data,
    businessId,
  };
}

export function belongsToBusiness(record, businessId) {
  return Boolean(record && record.businessId === businessId);
}
