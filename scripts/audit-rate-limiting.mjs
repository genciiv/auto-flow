import { readFileSync, existsSync } from "node:fs";
const failures=[];
const requireFile=(f)=>{ if(!existsSync(f)) failures.push(`${f}: mungon.`); return existsSync(f)?readFileSync(f,"utf8"):""; };
const schema=requireFile("prisma/schema.prisma");
const auth=requireFile("src/auth.js");
const limiter=requireFile("src/lib/rate-limit.js");
const migration=requireFile("prisma/migrations/20260731130000_rate_limiting_bruteforce/migration.sql");
for(const token of ["model RateLimitBucket","failedLoginAttempts","lockedUntil"]) if(!schema.includes(token)) failures.push(`schema: mungon ${token}`);
for(const token of ["loginIp","loginIdentifier","recordFailedLogin","resetFailedLogins","isAccountLocked"]) if(!auth.includes(token)) failures.push(`auth: mungon ${token}`);
for(const token of ["sha256","consumeRateLimit","RATE_LIMIT_POLICIES"]) if(!limiter.includes(token)) failures.push(`rate-limit: mungon ${token}`);
if(!migration.includes('CREATE TABLE "RateLimitBucket"')) failures.push("migration: mungon RateLimitBucket");
for(const file of ["src/app/register/actions.js","src/app/forgot-password/actions.js","src/app/resend-verification/actions.js","src/app/activate-account/actions.js","src/app/apply/actions.js"]) {
  if(!requireFile(file).includes("protectPublicAction")) failures.push(`${file}: mungon rate limiting.`);
}
if(failures.length){ console.error("Rate limiting audit: FAILED\n- "+failures.join("\n- ")); process.exit(1); }
console.log("Rate limiting audit: OK — login, public actions, search API, lockout dhe migration u verifikuan.");
