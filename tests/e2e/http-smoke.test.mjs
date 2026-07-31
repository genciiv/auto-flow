import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const enabled = Boolean(baseUrl);

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", ...options });
}

test("public routes përgjigjen dhe security headers janë aktive", { skip: !enabled }, async () => {
  for (const path of ["/", "/login", "/register", "/forgot-password", "/marketplace", "/privacy", "/terms"]) {
    const response = await request(path);
    assert.ok([200, 301, 302, 307, 308].includes(response.status), `${path}: ${response.status}`);
  }

  const response = await request("/");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.ok(response.headers.get("referrer-policy"));
});

test("private routes ridrejtojnë përdoruesin anonim te login", { skip: !enabled }, async () => {
  for (const path of ["/admin", "/dashboard", "/customer/dashboard"]) {
    const response = await request(path);
    assert.ok([302, 307, 308].includes(response.status), `${path}: ${response.status}`);
    const location = response.headers.get("location") || "";
    assert.match(location, /\/login/);
  }
});

test("unknown route kthen 404", { skip: !enabled }, async () => {
  const response = await request("/__autoflow_e2e_missing_route__");
  assert.equal(response.status, 404);
});
