import { db } from "@/lib/db";
const LOCK_STEPS=[0,0,0,0,0,5,15,30,60];
export function getLockMinutes(attempts){ return LOCK_STEPS[Math.min(attempts,LOCK_STEPS.length-1)] ?? 60; }
export function isAccountLocked(user, now=new Date()){ return Boolean(user?.lockedUntil && user.lockedUntil>now); }
export async function recordFailedLogin(userId){
  if(!userId) return null;
  return db.$transaction(async tx=>{ const user=await tx.user.findUnique({where:{id:userId},select:{failedLoginAttempts:true}}); if(!user)return null; const attempts=user.failedLoginAttempts+1; const minutes=getLockMinutes(attempts); const lockedUntil=minutes?new Date(Date.now()+minutes*60000):null;
    const updated=await tx.user.update({where:{id:userId},data:{failedLoginAttempts:attempts,lastFailedLoginAt:new Date(),lockedUntil},select:{failedLoginAttempts:true,lockedUntil:true}});
    await tx.auditLog.create({data:{userId,action:"LOGIN",entityType:"User",entityId:userId,title:lockedUntil?"Llogaria u bllokua përkohësisht":"Tentativë login-i e dështuar",description:"U regjistrua një tentativë e pasaktë hyrjeje.",metadata:{failedLoginAttempts:attempts,lockedUntil:lockedUntil?.toISOString()??null}}});
    return updated; });
}
export async function resetFailedLogins(userId){ return db.user.update({where:{id:userId},data:{failedLoginAttempts:0,lastFailedLoginAt:null,lockedUntil:null}}); }
