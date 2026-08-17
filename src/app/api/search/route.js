import { auth } from "@/auth";
import { apiError, apiFailure, apiSuccess } from "@/lib/api-response";
import { db } from "@/lib/db";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { getRequestId } from "@/lib/request-context";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { globalSearchSchema } from "@/schemas/api-schema";
import { consumeRateLimit, getClientIpFromHeaders, RATE_LIMIT_POLICIES, rateLimitHeaders } from "@/lib/rate-limit";

function unauthorizedResponse(requestId) {
  return apiFailure({ code: ERROR_CODES.UNAUTHENTICATED, message: "Duhet të identifikohesh.", data: { results: [] }, status: 401, requestId });
}

function forbiddenResponse(requestId) {
  return apiFailure({ code: ERROR_CODES.FORBIDDEN, message: "Nuk ke akses në kërkimin e biznesit.", data: { results: [] }, status: 403, requestId });
}

function buildContainsFilter(field, value) {
  return {
    [field]: {
      contains: value,
      mode: "insensitive",
    },
  };
}

function buildTokenOr(field, query, tokens) {
  return [
    buildContainsFilter(field, query),
    ...tokens.map((token) => buildContainsFilter(field, token)),
  ];
}

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse(requestId);
    }

    const searchLimit = await consumeRateLimit({
      scope: "search",
      identifiers: [getClientIpFromHeaders(request.headers), session.user.id],
      policy: RATE_LIMIT_POLICIES.search,
    });

    if (!searchLimit.allowed) {
      return apiFailure({ code: ERROR_CODES.RATE_LIMITED, message: "Shumë kërkesa kërkimi. Provo përsëri pas pak.", status: 429, requestId, headers: rateLimitHeaders(searchLimit), data: { results: [] } });
    }

    const businessId = session.user.businessId;
    const businessRole = session.user.businessRole;

    if (!businessId || !businessRole) {
      return forbiddenResponse(requestId);
    }

    const { searchParams } = new URL(request.url);

    const validationResult = validateObject(globalSearchSchema, {
      query: searchParams.get("q"),
    });

    if (!validationResult.success) {
      return apiFailure({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: getFirstValidationMessage(validationResult.error, "Kërkimi nuk është i vlefshëm."),
        fieldErrors: validationResult.fieldErrors,
        data: { results: [] },
        status: 400,
        requestId,
      });
    }

    const { query } = validationResult.data;
    const normalizedQuery = query.trim();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    if (normalizedQuery.length < 2) {
      return apiSuccess({ data: { results: [] }, requestId });
    }

    const canViewCustomers = hasPermission(businessRole, PERMISSIONS.CUSTOMERS_VIEW);
    const canViewVehicles = hasPermission(businessRole, PERMISSIONS.VEHICLES_VIEW);
    const canViewInvoices = hasPermission(businessRole, PERMISSIONS.INVOICES_VIEW);
    const canViewServices = hasPermission(businessRole, PERMISSIONS.SERVICES_VIEW);
    const canViewInventory = hasPermission(businessRole, PERMISSIONS.INVENTORY_VIEW);

    const [customers, vehicles, invoices, services, parts] = await Promise.all([
      canViewCustomers
        ? db.customer.findMany({
        where: {
          businessId,

          OR: [
            ...buildTokenOr("name", normalizedQuery, queryTokens),
            ...buildTokenOr("phone", normalizedQuery, queryTokens),
            ...buildTokenOr("email", normalizedQuery, queryTokens),
            ...buildTokenOr("city", normalizedQuery, queryTokens),
            {
              vehicles: {
                some: {
                  businessId,

                  OR: [
                    ...buildTokenOr("plate", normalizedQuery, queryTokens),
                    ...buildTokenOr("brand", normalizedQuery, queryTokens),
                    ...buildTokenOr("model", normalizedQuery, queryTokens),
                  ],
                },
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          vehicles: {
            where: {
              businessId,
            },

            orderBy: {
              createdAt: "desc",
            },

            take: 2,
          },
        },

        take: 5,
          })
        : Promise.resolve([]),

      canViewVehicles
        ? db.vehicle.findMany({
        where: {
          businessId,

          OR: [
            ...buildTokenOr("plate", normalizedQuery, queryTokens),
            ...buildTokenOr("brand", normalizedQuery, queryTokens),
            ...buildTokenOr("model", normalizedQuery, queryTokens),
            ...buildTokenOr("vin", normalizedQuery, queryTokens),
            {
              customer: {
                is: {
                  businessId,

                  OR: buildTokenOr("name", normalizedQuery, queryTokens),
                },
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          customer: true,
        },

        take: 5,
          })
        : Promise.resolve([]),

      canViewInvoices
        ? db.invoice.findMany({
        where: {
          businessId,

          OR: [
            {
              number: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
            {
              customer: {
                is: {
                  businessId,

                  OR: buildTokenOr("name", normalizedQuery, queryTokens),
                },
              },
            },
            {
              vehicle: {
                is: {
                  businessId,

                  OR: [
                    {
                      plate: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      brand: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      model: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
            {
              service: {
                is: {
                  businessId,

                  title: {
                    contains: normalizedQuery,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          customer: true,
          vehicle: true,
          service: true,
        },

        take: 5,
          })
        : Promise.resolve([]),

      canViewServices
        ? db.serviceRecord.findMany({
        where: {
          businessId,
          ...(businessRole === "MECHANIC" ? { assignedUserId: session.user.id } : {}),

          OR: [
            {
              title: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
            {
              vehicle: {
                is: {
                  businessId,

                  OR: [
                    {
                      plate: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      brand: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                    {
                      model: {
                        contains: normalizedQuery,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
            {
              partsUsed: {
                some: {
                  part: {
                    is: {
                      businessId,

                      OR: [
                        {
                          name: {
                            contains: normalizedQuery,
                            mode: "insensitive",
                          },
                        },
                        {
                          code: {
                            contains: normalizedQuery,
                            mode: "insensitive",
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          vehicle: true,
        },

        take: 5,
          })
        : Promise.resolve([]),

      canViewInventory
        ? db.part.findMany({
        where: {
          businessId,

          OR: [
            {
              name: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
            {
              supplier: {
                contains: normalizedQuery,
                mode: "insensitive",
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 5,
          })
        : Promise.resolve([]),
    ]);

    const results = [
      ...customers.map((customer) => {
        const vehicleText = customer.vehicles
          .map((vehicle) => {
            return [vehicle.brand, vehicle.model, vehicle.plate]
              .filter(Boolean)
              .join(" ");
          })
          .join(", ");

        return {
          id: `customer-${customer.id}`,
          entityId: customer.id,
          type: "Klient",
          category: "customer",
          title: customer.name,

          subtitle:
            [customer.phone, customer.city, vehicleText]
              .filter(Boolean)
              .join(" • ") || "Pa të dhëna shtesë",

          href: "/dashboard/customers",
        };
      }),

      ...vehicles.map((vehicle) => {
        const vehicleName = [vehicle.brand, vehicle.model]
          .filter(Boolean)
          .join(" ");

        return {
          id: `vehicle-${vehicle.id}`,
          entityId: vehicle.id,
          type: "Automjet",
          category: "vehicle",
          title: vehicleName || vehicle.plate,

          subtitle: [
            vehicle.plate,
            vehicle.customer?.name,
            vehicle.year ? String(vehicle.year) : null,
          ]
            .filter(Boolean)
            .join(" • "),

          href: "/dashboard/vehicles",
        };
      }),

      ...invoices.map((invoice) => {
        return {
          id: `invoice-${invoice.id}`,
          entityId: invoice.id,
          type: "Faturë",
          category: "invoice",
          title: `Fatura ${invoice.number}`,

          subtitle: [
            invoice.customer?.name,
            invoice.vehicle?.plate,
            invoice.status,
          ]
            .filter(Boolean)
            .join(" • "),

          amount: Number(invoice.total || 0),
          href: `/dashboard/invoices/${invoice.id}`,
        };
      }),

      ...services.map((service) => {
        const vehicleText = service.vehicle
          ? [
              service.vehicle.plate,
              service.vehicle.brand,
              service.vehicle.model,
            ]
              .filter(Boolean)
              .join(" • ")
          : null;

        return {
          id: `service-${service.id}`,
          entityId: service.id,
          type: "Shërbim",
          category: "service",
          title: service.title,

          subtitle: [vehicleText, service.status].filter(Boolean).join(" • "),

          amount: Number(service.total || 0),
          href: "/dashboard/services",
        };
      }),

      ...parts.map((part) => {
        return {
          id: `part-${part.id}`,
          entityId: part.id,
          type: "Pjesë",
          category: "part",
          title: part.name,

          subtitle: [part.code, `${part.stock} copë në stok`, part.category]
            .filter(Boolean)
            .join(" • "),

          amount: Number(part.sellPrice || 0),
          href: "/dashboard/inventory",
        };
      }),
    ];

    return apiSuccess({ data: { results }, requestId });
  } catch (error) {
    logServerError("api/search", error, null, requestId);
    return apiError(error, { requestId, fallbackMessage: "Kërkimi nuk mund të përfundohej." });
  }
}
