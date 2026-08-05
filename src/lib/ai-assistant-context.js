import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/formatters";
import { getInvoicePaymentSummary, INVOICE_PAYMENT_STATUS } from "@/lib/invoice-payment-status";
import { getServiceFinancialSummary } from "@/lib/service-financial-summary";

const COMPLETED_STATUSES = ["COMPLETED", "DELIVERED"];

function normalizeQuestion(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("sq-AL");
}

function buildServiceLabel(service) {
  const vehicle = [service.vehicle?.brand, service.vehicle?.model]
    .filter(Boolean)
    .join(" ");
  const plate = service.vehicle?.plate ? ` (${service.vehicle.plate})` : "";

  return `${service.title}${vehicle ? ` · ${vehicle}${plate}` : plate}`;
}

export async function getAiAssistantSnapshot({ businessId }) {
  const services = await db.serviceRecord.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      total: true,
      createdAt: true,
      vehicle: {
        select: {
          plate: true,
          brand: true,
          model: true,
        },
      },
      invoice: {
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          customerPayments: {
            select: { amount: true },
          },
        },
      },
    },
  });

  const financial = getServiceFinancialSummary(services);
  const completed = services.filter((service) =>
    COMPLETED_STATUSES.includes(service.status),
  );
  const readyForPickup = services.filter(
    (service) => service.status === "READY_FOR_PICKUP",
  );

  return {
    services,
    financial,
    completedCount: completed.length,
    readyForPickupCount: readyForPickup.length,
  };
}

export function answerAiAssistantQuestion({ question, snapshot }) {
  const normalized = normalizeQuestion(question);
  const { services, financial } = snapshot;

  const paidServices = services.filter(
    (service) =>
      getInvoicePaymentSummary(service.invoice).status ===
      INVOICE_PAYMENT_STATUS.PAID,
  );
  const completedUnpaid = services.filter((service) => {
    const paymentStatus = getInvoicePaymentSummary(service.invoice).status;

    return (
      COMPLETED_STATUSES.includes(service.status) &&
      service.invoice &&
      paymentStatus !== INVOICE_PAYMENT_STATUS.PAID
    );
  });
  const withoutInvoice = services.filter((service) => !service.invoice);
  const readyForPickup = services.filter(
    (service) => service.status === "READY_FOR_PICKUP",
  );

  if (/paguar|arkëtuar|arketime|te ardhura|të ardhura/.test(normalized)) {
    return {
      title: "Përmbledhja e pagesave",
      answer: `Janë regjistruar ${financial.paidServices} shërbime të paguara plotësisht dhe ${financial.partiallyPaidServices} me pagesë të pjesshme. Totali i arkëtuar është ${formatCurrency(financial.collectedValue)}, ndërsa për t’u arkëtuar mbeten ${formatCurrency(financial.outstandingValue)}.`,
      items: paidServices.slice(0, 5).map(buildServiceLabel),
    };
  }

  if (/papaguar|detyrim|borxh|mbetur/.test(normalized)) {
    return {
      title: "Shërbime të përfunduara me detyrim",
      answer:
        completedUnpaid.length === 0
          ? "Nuk ka shërbime të përfunduara me faturë të papaguar."
          : `Ka ${completedUnpaid.length} shërbime të përfunduara ose të dorëzuara që nuk janë paguar plotësisht.`,
      items: completedUnpaid.slice(0, 8).map(buildServiceLabel),
    };
  }

  if (/pa fatur|faturë mungon|fature mungon/.test(normalized)) {
    return {
      title: "Shërbime pa faturë",
      answer: `Aktualisht ${withoutInvoice.length} shërbime nuk kanë faturë të lidhur.`,
      items: withoutInvoice.slice(0, 8).map(buildServiceLabel),
    };
  }

  if (/gati|dorëzim|dorezim|pickup/.test(normalized)) {
    return {
      title: "Automjete gati për dorëzim",
      answer: `Ka ${readyForPickup.length} shërbime me statusin “Gati për dorëzim”.`,
      items: readyForPickup.slice(0, 8).map(buildServiceLabel),
    };
  }

  if (/përfunduar|perfunduara|kompletuar/.test(normalized)) {
    return {
      title: "Shërbime të përfunduara",
      answer: `Janë ${snapshot.completedCount} shërbime të përfunduara ose të dorëzuara.`,
      items: services
        .filter((service) => COMPLETED_STATUSES.includes(service.status))
        .slice(0, 8)
        .map(buildServiceLabel),
    };
  }

  return {
    title: "Përmbledhje e biznesit",
    answer: `Ke ${financial.totalServices} shërbime gjithsej: ${financial.paidServices} të paguara, ${financial.partiallyPaidServices} pjesërisht të paguara, ${financial.unpaidServices} të papaguara dhe ${financial.noInvoiceServices} pa faturë. Janë arkëtuar ${formatCurrency(financial.collectedValue)}.`,
    items: [
      "Pyet: Cilat shërbime janë të përfunduara por të papaguara?",
      "Pyet: Sa kemi arkëtuar?",
      "Pyet: Cilat automjete janë gati për dorëzim?",
      "Pyet: Cilat shërbime janë pa faturë?",
    ],
  };
}
