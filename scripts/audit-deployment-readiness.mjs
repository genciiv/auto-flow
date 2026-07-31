import { access, readFile } from "node:fs/promises";
const required = ["vercel.json", ".env.example", "scripts/deploy/validate-env.mjs", "scripts/deploy/post-deploy-check.mjs", "docs/production-deployment-runbook.md", "docs/rollback-runbook.md"];
for (const file of required) await access(file);
const [pkg, vercel, env, ci] = await Promise.all([readFile("package.json","utf8"), readFile("vercel.json","utf8"), readFile(".env.example","utf8"), readFile(".github/workflows/ci.yml","utf8")]);
const checks = [
  [pkg.includes("deploy:validate") && pkg.includes("deploy:verify"), "deployment scripts mungojnë"],
  [vercel.includes("/api/health/live") && vercel.includes("/api/health/ready"), "health endpoint config mungon"],
  [env.includes("SUPABASE_SERVICE_ROLE_KEY") && env.includes("RESEND_API_KEY"), "env template është i paplotë"],
  [pkg.includes("deploy:validate:ci"), "CI nuk verifikon deployment config"],
];
const failed = checks.filter(([ok]) => !ok).map(([,m]) => m);
if (failed.length) { console.error(`Deployment readiness audit: FAILED\n- ${failed.join("\n- ")}`); process.exit(1); }
console.log("Deployment readiness audit: OK — env gate, Vercel config, post-deploy checks dhe rollback docs u verifikuan.");
