import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const enabled = Boolean(baseUrl);

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", ...options });
}

test("public routes pÃ«rgjigjen dhe security headers janÃ« aktive", { skip: !enabled }, async () => {
  for (const path of ["/", "/login", "/register", "/forgot-password", "/privacy", "/terms"]) {
    const response = await request(path);
    assert.ok([200, 301, 302, 307, 308].includes(response.status), `${path}: ${response.status}`);
  }

  const response = await request("/");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.ok(response.headers.get("referrer-policy"));
});

test("private routes ridrejtojnÃ« pÃ«rdoruesin anonim te login", { skip: !enabled }, async () => {
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

test("liveness endpoint raporton shÃ«rbimin aktiv", { skip: !enabled }, async () => {
  const response = await request("/api/health/live");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const payload = await response.json();
  assert.equal(payload.data.status, "ok");
});

