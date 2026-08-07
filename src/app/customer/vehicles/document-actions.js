"use server";
import { revalidatePath } from "next/cache";
import { actionSuccess, errorFailure, validationFailure } from "@/lib/action-result";
import { requireCustomerActionContext } from "@/lib/customer-context";
import { validateFormData, validateObject } from "@/lib/validation";
import { createCustomerVehicleDocumentSchema, deleteCustomerVehicleDocumentSchema, parseDocumentDate } from "@/schemas/customer-vehicle-document-schema";
import { createCustomerVehicleDocument as createDocument, deleteCustomerVehicleDocument as deleteDocument } from "@/services/customer-vehicle-document-service";

function revalidate(vehicleId){ revalidatePath(`/customer/vehicles/${vehicleId}`); revalidatePath('/customer/dashboard'); }

export async function createCustomerVehicleDocument(previousState, formData){
  try{
    const { profileId } = await requireCustomerActionContext();
    const validation = validateFormData(createCustomerVehicleDocumentSchema, formData);
    if(!validation.success) return validationFailure(validation.error,{message:'Kontrollo të dhënat e dokumentit.'});
    const d=validation.data;
    await createDocument({ profileId, vehicleId:d.vehicleId, type:d.type, title:d.title, issuedAt:parseDocumentDate(d.issuedAt), expiresAt:parseDocumentDate(d.expiresAt), remindDaysBefore:d.remindDaysBefore, notes:d.notes, file:formData.get('file') });
    revalidate(d.vehicleId);
    return actionSuccess({message:'Dokumenti u ruajt në dosjen e automjetit.'});
  }catch(error){ return errorFailure(error,{fallbackMessage:'Dokumenti nuk mund të ruhej.'}); }
}

export async function deleteCustomerVehicleDocument(vehicleId, documentId){
  try{
    const { profileId } = await requireCustomerActionContext();
    const validation=validateObject(deleteCustomerVehicleDocumentSchema,{vehicleId,documentId});
    if(!validation.success) return validationFailure(validation.error);
    await deleteDocument({profileId,...validation.data});
    revalidate(validation.data.vehicleId);
    return actionSuccess({message:'Dokumenti u fshi.'});
  }catch(error){ return errorFailure(error,{fallbackMessage:'Dokumenti nuk mund të fshihej.'}); }
}
