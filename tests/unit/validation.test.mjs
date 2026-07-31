import test from "node:test";
import assert from "node:assert/strict";

import {
  formDataToObject,
  getFieldErrors,
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";

const successSchema = {
  safeParse(input) {
    return { success: true, data: { ...input, normalized: true } };
  },
};

const failedError = {
  issues: [{ message: "Fusha është e pavlefshme." }],
  flatten() {
    return {
      fieldErrors: {
        email: ["Email-i është i pavlefshëm.", "Mesazh i dytë."],
        empty: [],
      },
    };
  },
};

const failureSchema = {
  safeParse() {
    return { success: false, error: failedError };
  },
};

test("formDataToObject konverton FormData", () => {
  const formData = new FormData();
  formData.set("email", "test@example.com");

  assert.deepEqual(formDataToObject(formData), { email: "test@example.com" });
  assert.deepEqual(formDataToObject({}), {});
});

test("validateObject kthen të dhënat e normalizuara në sukses", () => {
  const result = validateObject(successSchema, { name: "AutoFlow" });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, { name: "AutoFlow", normalized: true });
  assert.deepEqual(result.fieldErrors, {});
});

test("validateFormData kthen vetëm mesazhin e parë për fushë", () => {
  const formData = new FormData();
  formData.set("email", "bad");

  const result = validateFormData(failureSchema, formData);

  assert.equal(result.success, false);
  assert.deepEqual(result.fieldErrors, { email: "Email-i është i pavlefshëm." });
});

test("validation helpers kanë fallback të sigurt", () => {
  assert.equal(getFirstValidationMessage(null, "Fallback"), "Fallback");
  assert.deepEqual(getFieldErrors(null), {});
  assert.equal(getFirstValidationMessage(failedError), "Fusha është e pavlefshme.");
});
