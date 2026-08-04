import { formatMoney } from "./money";

export function parseFinancePeriod(searchParams = {}) {
  const now = new Date();
  const preset = String(searchParams.preset || "month");

  let start;
  let end;

  if (preset === "quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;

    start = new Date(now.getFullYear(), quarterStartMonth, 1);
    end = new Date(
      now.getFullYear(),
      quarterStartMonth + 3,
      0,
      23,
      59,
      59,
      999,
    );
  } else if (preset === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else if (
    preset === "custom" &&
    searchParams.start &&
    searchParams.end
  ) {
    start = new Date(`${searchParams.start}T00:00:00`);
    end = new Date(`${searchParams.end}T23:59:59.999`);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  }

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    throw new Error("Periudha nuk është e vlefshme.");
  }

  return {
    preset,
    start,
    end,
    startInput: start.toISOString().slice(0, 10),
    endInput: end.toISOString().slice(0, 10),
  };
}

export function money(value, currency = "ALL") {
  return formatMoney(value, {
    currency,
    locale: "sq-AL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
