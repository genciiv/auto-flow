import { getClientIp, enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";
export async function protectPublicAction(scope, identifier="") { const ip=await getClientIp(); return enforceRateLimit({scope,identifiers:[ip,identifier],policy:RATE_LIMIT_POLICIES[scope]}); }
export function rateLimitActionState(error, fallback={}) { if(error?.code!=="RATE_LIMITED") return null; const minutes=Math.max(1,Math.ceil((error.retryAfterSeconds||60)/60)); return {...fallback,success:false,error:`Shumë tentativa. Provo përsëri pas rreth ${minutes} minutash.`,message:null}; }
