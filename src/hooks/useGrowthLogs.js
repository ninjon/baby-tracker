import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches all growth_logs for a baby, ordered oldest-first so charts
 * render left-to-right in chronological order.
 *
 * @param {string | null} babyId
 * @returns {{ logs: object[], loading: boolean }}
 */
export function useGrowthLogs(babyId) {
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
      .from("growth_logs")
      .select("*")
      .eq("baby_id", babyId)
      .order("measured_at", { ascending: true });

    setLogs(data ?? []);
    setLoading(false);
  }, [babyId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading };
}
