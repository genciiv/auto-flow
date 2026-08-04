import assert from "node:assert/strict";
import test from "node:test";

import {
  addMoney,
  compareMoney,
  divideMoney,
  formatMoney,
  isMoneyGreaterThan,
  isMoneyZero,
  moneyToNumber,
  moneyToString,
  multiplyMoney,
  quantityToString,
  serializeMoney,
  subtractMoney,
  toMoney,
  toQuantity,
} from "../../src/lib/money.js";

test("toMoney normalizon vlerat me dy shifra dhjetore", () => {
  assert.equal(toMoney("12.345").toString(), "12.35");
  assert.equal(toMoney("12,34").toString(), "12.34");
  assert.equal(toMoney(null).toString(), "0");
});

test("mbledhja monetare shmang problemet e floating point", () => {
  assert.equal(addMoney("0.10", "0.20").toFixed(2), "0.30");
});

test("subtractMoney kthen diferencën me rounding të kontrolluar", () => {
  assert.equal(subtractMoney("10.00", "3.335").toFixed(2), "6.66");
});

test("multiplyMoney llogarit quantity me unit price", () => {
  assert.equal(multiplyMoney("1.5", "1200").toFixed(2), "1800.00");
});

test("divideMoney refuzon pjestimin me zero", () => {
  assert.throws(
    () => divideMoney("10", "0"),
    /Pjestimi me zero nuk lejohet/,
  );
});

test("krahasimet monetare përdorin Decimal", () => {
  assert.equal(compareMoney("10.00", "10"), 0);
  assert.equal(isMoneyGreaterThan("10.01", "10.00"), true);
  assert.equal(isMoneyZero("0.004"), true);
});

test("serializimi monetar është i qëndrueshëm", () => {
  assert.equal(moneyToString("3900"), "3900.00");
  assert.equal(serializeMoney("12.5"), "12.50");
  assert.equal(serializeMoney(null), null);
  assert.equal(moneyToNumber("12.50"), 12.5);
});

test("quantity ruan tre shifra dhjetore", () => {
  assert.equal(toQuantity("1.2345").toFixed(3), "1.235");
  assert.equal(quantityToString("0.25"), "0.250");
});

test("formatMoney formaton sipas currency dhe locale", () => {
  const formatted = formatMoney("3900", {
    currency: "ALL",
    locale: "sq-AL",
  });

  const normalized = formatted
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/[.,\s]/g, "");

  assert.match(normalized, /3900/);
  assert.match(formatted, /ALL|Lekë/i);
});
