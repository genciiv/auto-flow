import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");

test("Google OAuth është konfiguruar me credential-et nga environment", async () => {
  const auth = await read("src/auth.js");
  assert.match(auth, /next-auth\/providers\/google/);
  assert.match(auth, /AUTH_GOOGLE_ID/);
  assert.match(auth, /AUTH_GOOGLE_SECRET/);
});

test("Google OAuth pranon vetëm email të verifikuar dhe llogari personale CUSTOMER", async () => {
  const auth = await read("src/auth.js");
  assert.match(auth, /profile\?\.email_verified !== true/);
  assert.match(auth, /databaseUser\.globalRole !== "CUSTOMER"/);
  assert.match(auth, /user\.loginPortal = "personal"/);
});

test("Google OAuth krijon CUSTOMER dhe CustomerProfile për përdorues të ri", async () => {
  const auth = await read("src/auth.js");
  assert.match(auth, /globalRole: "CUSTOMER"/);
  assert.match(auth, /passwordHash: null/);
  assert.match(auth, /customerProfile: \{ create: \{\} \}/);
  assert.match(auth, /emailVerified: new Date\(\)/);
});

test("social action përdor Google dhe redirect-in e centralizuar", async () => {
  const action = await read("src/app/auth/social-actions.js");
  assert.match(action, /signIn\("google"/);
  assert.match(action, /redirectTo: "\/auth\/redirect"/);
});

test("login dhe register ekspozojnë butonin Google", async () => {
  const login = await read("src/app/login/login-form.jsx");
  const register = await read("src/app/register/register-form.jsx");
  assert.match(login, /GoogleAuthButton/);
  assert.match(login, /Vazhdo me Google/);
  assert.match(register, /GoogleAuthButton/);
  assert.match(register, /Regjistrohu me Google/);
});
