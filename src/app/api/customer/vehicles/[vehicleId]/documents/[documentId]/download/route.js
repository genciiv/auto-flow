import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getCustomerVehicleDocumentStorage } from "@/lib/customer-vehicle-document-storage";

export async function GET(request,{params}){
 const session=await auth(); if(!session?.user?.id||session.user.globalRole!=="CUSTOMER") return new Response("Unauthorized",{status:401});
 const {vehicleId,documentId}=await params;
 const doc=await db.customerVehicleDocument.findFirst({where:{id:documentId,customerVehicleId:vehicleId,customerVehicle:{profile:{userId:session.user.id}}},select:{storagePath:true,fileName:true}});
 if(!doc) return new Response("Not found",{status:404});
 let storage;
 try { storage=await getCustomerVehicleDocumentStorage(); } catch { return new Response("Storage unavailable",{status:503}); }
 const {data,error}=await storage.supabase.storage.from(storage.bucket).createSignedUrl(doc.storagePath,60,{download:doc.fileName});
 if(error||!data?.signedUrl) return new Response("Download unavailable",{status:502});
 return Response.redirect(data.signedUrl,302);
}
