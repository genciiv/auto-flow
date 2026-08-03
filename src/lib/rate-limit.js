import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export const RATE_LIMIT_POLICIES = Object.freeze({
  loginIp: { limit: 20, windowSeconds: 900, blockSeconds: 900 },
  loginIdentifier: { limit: 8, windowSeconds: 900, blockSeconds: 900 },
  register: { limit: 5, windowSeconds: 3600, blockSeconds: 3600 },
  forgotPassword: { limit: 5, windowSeconds: 3600, blockSeconds: 3600 },
  resendVerification: { limit: 4, windowSeconds: 3600, blockSeconds: 3600 },
  activateAccount: { limit: 10, windowSeconds: 3600, blockSeconds: 3600 },
  businessApplication: { limit: 5, windowSeconds: 86400, blockSeconds: 86400 },
  search: { limit: 120, windowSeconds: 60, blockSeconds: 60 },
});

export function normalizeIdentifier(value) { return String(value ?? "").trim().toLowerCase(); }
export function hashRateLimitKey(scope, parts) {
  return createHash("sha256").update([scope, ...parts.map(normalizeIdentifier)].join(":"), "utf8").digest("hex");
}
export function getClientIpFromHeaders(headerStore) {
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerStore.get("x-real-ip") || "unknown";
}
export async function getClientIp() { return getClientIpFromHeaders(await headers()); }

export async function consumeRateLimit({ scope, identifiers, policy }) {
  const now = new Date(); const keyHash = hashRateLimitKey(scope, identifiers);
  return db.$transaction(async (tx) => {
    const existing = await tx.rateLimitBucket.findUnique({ where: { keyHash } });
    if (existing?.blockedUntil && existing.blockedUntil > now) return { allowed:false, retryAfterSeconds:Math.ceil((existing.blockedUntil-now)/1000), remaining:0 };
    const windowMs = policy.windowSeconds * 1000;
    if (!existing || existing.expiresAt <= now) {
      await tx.rateLimitBucket.upsert({ where:{keyHash}, create:{keyHash,scope,count:1,windowStart:now,expiresAt:new Date(now.getTime()+windowMs)}, update:{scope,count:1,windowStart:now,expiresAt:new Date(now.getTime()+windowMs),blockedUntil:null} });
      return { allowed:true, retryAfterSeconds:0, remaining:Math.max(0,policy.limit-1) };
    }
    const nextCount=existing.count+1; const blockedUntil=nextCount>policy.limit?new Date(now.getTime()+policy.blockSeconds*1000):null;
    await tx.rateLimitBucket.update({where:{keyHash},data:{count:nextCount,blockedUntil}});
    return nextCount>policy.limit ? {allowed:false,retryAfterSeconds:policy.blockSeconds,remaining:0} : {allowed:true,retryAfterSeconds:0,remaining:Math.max(0,policy.limit-nextCount)};
  });
}
export async function enforceRateLimit(args) {
  const result=await consumeRateLimit(args);
  if (!result.allowed) { const error=new Error("Shumë kërkesa. Provo përsëri pas pak."); error.code="RATE_LIMITED"; error.status=429; error.retryAfterSeconds=result.retryAfterSeconds; throw error; }
  return result;
}
export function rateLimitHeaders(result) { return { "ratelimit-remaining":String(result.remaining ?? 0), ...(result.retryAfterSeconds?{"retry-after":String(result.retryAfterSeconds)}:{}) }; }
