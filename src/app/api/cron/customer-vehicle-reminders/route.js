import { timingSafeEqual } from "node:crypto";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getRequestId } from "@/lib/request-context";
import { processCustomerVehicleDocumentReminders } from "@/services/customer-vehicle-reminder-notification-service";
function authorized(request){const e=process.env.CRON_SECRET;const r=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!e||!r)return false;const a=Buffer.from(e),b=Buffer.from(r);return a.length===b.length&&timingSafeEqual(a,b)}
export async function GET(request){const requestId=getRequestId(request);try{if(!authorized(request))return new Response(JSON.stringify({success:false,code:"UNAUTHORIZED",message:"Unauthorized",requestId}),{status:401,headers:{"content-type":"application/json","cache-control":"no-store","x-request-id":requestId}});const data=await processCustomerVehicleDocumentReminders();return apiSuccess({requestId,data});}catch(error){return apiError(error,{request,requestId,fallbackMessage:"Kontrolli i kujtesave të dokumenteve dështoi."});}}
