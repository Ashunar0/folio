"use client";

import { createContext, useContext, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/types";

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => createSupabaseBrowserClient());

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return client;
}
