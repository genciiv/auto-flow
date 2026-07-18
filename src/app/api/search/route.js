import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = String(searchParams.get("q") || "").trim();

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const [customers, vehicles, invoices, services, parts] = await Promise.all([
      db.customer.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              vehicles: {
                some: {
                  OR: [
                    {
                      plate: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      brand: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      model: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
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
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
          },
        },
        take: 5,
      }),

      db.vehicle.findMany({
        where: {
          OR: [
            {
              plate: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              brand: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              model: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              vin: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              customer: {
                is: {
                  name: {
                    contains: query,
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
        },
        take: 5,
      }),

      db.invoice.findMany({
        where: {
          OR: [
            {
              number: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              customer: {
                is: {
                  name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              vehicle: {
                is: {
                  OR: [
                    {
                      plate: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      brand: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                    {
                      model: {
                        contains: query,
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
                  title: {
                    contains: query,
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
      }),

      db.serviceRecord.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              vehicle: {
                OR: [
                  {
                    plate: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    model: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
            {
              partsUsed: {
                some: {
                  part: {
                    OR: [
                      {
                        name: {
                          contains: query,
                          mode: "insensitive",
                        },
                      },
                      {
                        code: {
                          contains: query,
                          mode: "insensitive",
                        },
                      },
                    ],
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
      }),

      db.part.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              supplier: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
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

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Global search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Kërkimi nuk mund të përfundohej.",
        results: [],
      },
      {
        status: 500,
      },
    );
  }
}
