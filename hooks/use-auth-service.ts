import {
  EmailPasswordCredentials,
  signInWithEmailPassword,
  signOut,
  signUpWithEmailPassword,
  SignUpCredentials,
} from "@/lib/auth/api";
import { useSupabase } from "@/providers/supabase-provider";

export function useAuthService() {
  const supabase = useSupabase();

  return {
    signIn: (credentials: EmailPasswordCredentials) =>
      signInWithEmailPassword(supabase, credentials),
    signUp: (credentials: SignUpCredentials) =>
      signUpWithEmailPassword(supabase, credentials),
    signOut: () => signOut(supabase),
  };
}
