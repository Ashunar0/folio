import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";

type AuthClient = SupabaseClient<Database>;

export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = EmailPasswordCredentials & {
  name?: string;
};

export async function signInWithEmailPassword(
  client: AuthClient,
  credentials: EmailPasswordCredentials
) {
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error) throw error;
  return data;
}

export async function signOut(client: AuthClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function signUpWithEmailPassword(
  client: AuthClient,
  credentials: SignUpCredentials
) {
  const { email, password, name } = credentials;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: name ? { name } : undefined,
    },
  });
  if (error) throw error;
  return data;
}
