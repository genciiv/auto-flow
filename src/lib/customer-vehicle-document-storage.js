import { createActionError, ERROR_CODES } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/supabase-server";

let verifiedBucketName = null;

export async function getCustomerVehicleDocumentStorage() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw createActionError("Storage i dokumenteve nuk është konfiguruar.", {
      code: ERROR_CODES.STORAGE_ERROR,
      status: 500,
    });
  }

  const supabase = getSupabaseAdmin();

  if (verifiedBucketName !== bucket) {
    const { data, error } = await supabase.storage.getBucket(bucket);
    if (error || !data) {
      throw createActionError("Bucket-i i dokumenteve nuk është i aksesueshëm.", {
        code: ERROR_CODES.STORAGE_ERROR,
        status: 500,
      });
    }
    if (data.public) {
      throw createActionError(
        "Bucket-i i dokumenteve duhet të jetë privat për të mbrojtur skedarët e klientëve.",
        { code: ERROR_CODES.STORAGE_ERROR, status: 500 },
      );
    }
    verifiedBucketName = bucket;
  }

  return { supabase, bucket };
}
