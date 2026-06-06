import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches all health_logs for a baby, ordered newest-first.
 *
 * @param {string | null} babyId
 * @returns {{ logs: object[], loading: boolean, save: Function }}
 */
export function useHealthLogs(babyId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!babyId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("health_logs")
      .select("*")
      .eq("baby_id", babyId)
      .order("timestamp", { ascending: false });

    setLogs(data ?? []);
    setLoading(false);
  }, [babyId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function save(entry) {
    await supabase.from("health_logs").insert(entry);
    await fetchLogs();
  }

  return { logs, loading, save };
}
