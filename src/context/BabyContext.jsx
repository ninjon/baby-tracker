import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const BabyContext = createContext(null);

export function BabyProvider({ children }) {
  const [session, setSession] = useState(null);
  const [baby, setBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadBaby(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session) loadBaby(session.user.id);
      else {
        setBaby(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadBaby(userId) {
    const { data } = await supabase
      .from("family_members")
      .select("babies(*)")
      .eq("user_id", userId)
      .not("accepted_at", "is", null)
      .order("invited_at", { ascending: true })
      .limit(1)
      .single();

    setBaby(data?.babies ?? null);
    setLoading(false);
  }

  async function sendMagicLink(email) {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  }

  async function updateBaby(updates) {
    const { data, error } = await supabase
      .from("babies")
      .update(updates)
      .eq("id", baby.id)
      .select()
      .single();
    if (!error && data) setBaby(data);
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <BabyContext.Provider
      value={{
        session,
        baby,
        loading,
        setBaby,
        sendMagicLink,
        updateBaby,
        signOut,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const ctx = useContext(BabyContext);
  if (!ctx) throw new Error("useBaby must be used inside BabyProvider");
  return ctx;
}
