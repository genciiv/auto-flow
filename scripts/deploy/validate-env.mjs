import nextEnv from "@next/env";
import { validateDeploymentEnvironment } from "../../src/lib/env-validation.mjs";

nextEnv.loadEnvConfig(process.cwd());
const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const target = targetArg?.split("=")[1] || process.env.APP_ENV || process.env.VERCEL_ENV || "development";
const result = validateDeploymentEnvironment(process.env, { target });

for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
if (!result.ok) {
  console.error(`Deployment environment validation failed (${target}):\n- ${result.errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Deployment environment validation: OK (${target}).`);
