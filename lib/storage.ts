import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";

type UploadReceiptParams = {
  supabase: SupabaseClient<Database>;
  file: File;
  teamId: string;
  userId: string;
};

export async function uploadReceipt({
  supabase,
  file,
  teamId,
  userId,
}: UploadReceiptParams) {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${teamId}/${userId}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage.from("receipts").upload(
    path,
    file,
    {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
      metadata: {
        team_id: teamId,
        user_id: userId,
      },
    }
  );

  if (error) {
    throw error;
  }

  return data?.path ?? path;
}
