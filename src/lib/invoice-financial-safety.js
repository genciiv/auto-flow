import { addMoney, subtractMoney, toMoney } from "@/lib/money";

const SERIALIZABLE_RETRY_CODES = new Set(["P2034"]);

export async function runSerializableInvoiceTransaction(
  database,
  callback,
  { maxAttempts = 3 } = {},
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await database.$transaction(callback, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      lastError = error;

      if (
        !SERIALIZABLE_RETRY_CODES.has(error?.code) ||
        attempt === maxAttempts
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function getPaidAndRemaining(invoice) {
  const total = toMoney(invoice.total ?? 0);
  const paid = (invoice.customerPayments ?? []).reduce(
    (sum, payment) => addMoney(sum, payment.amount),
    toMoney(0),
  );
  const calculatedRemaining = subtractMoney(total, paid);

  return {
    total,
    paid,
    remaining: calculatedRemaining.lt(0)
      ? toMoney(0)
      : calculatedRemaining,
  };
}

export async function nextInvoiceNumberInTransaction(
  transaction,
  businessId,
  date = new Date(),
) {
  const year = date.getFullYear();
  const prefix = `INV-${year}-`;
  const invoices = await transaction.invoice.findMany({
    where: {
      businessId,
      number: { startsWith: prefix },
    },
    select: { number: true },
  });

  let highestSequence = 0;

  for (const invoice of invoices) {
    const sequence = Number(invoice.number.slice(prefix.length));

    if (Number.isInteger(sequence) && sequence > highestSequence) {
      highestSequence = sequence;
    }
  }

  return `${prefix}${String(highestSequence + 1).padStart(4, "0")}`;
}
