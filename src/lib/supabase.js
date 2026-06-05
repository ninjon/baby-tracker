import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

// Use implicit flow so magic links work when opened from email clients.
// PKCE (the default in v2.32+) stores a code_verifier in the originating
// tab's localStorage; clicking a link in Gmail or a new tab breaks that
// chain. Implicit flow uses hash fragments (#access_token=...) instead,
// which work from any browser context.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "implicit",
  },
});
