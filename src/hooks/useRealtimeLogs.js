import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const TABLES = [
  { table: "feeding_logs", category: "feeding", timeField: "timestamp" },
  { table: "diaper_logs", category: "diaper", timeField: "timestamp" },
  { table: "sleep_logs", category: "sleep", timeField: "start_time" },
  { table: "growth_logs", category: "growth", timeField: "measured_at" },
  { table: "pump_logs", category: "pump", timeField: "timestamp" },
];

export function useRealtimeLogs(babyId, limit = 100) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!babyId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const results = await Promise.all(
      TABLES.map(({ table, category, timeField }) =>
        supabase
          .from(table)
          .select("*")
          .eq("baby_id", babyId)
          .order(timeField, { ascending: false })
          .limit(limit)
          .then(({ data }) =>
            (data ?? []).map((row) => ({
              ...row,
              category,
              sortTime: row[timeField],
            })),
          ),
      ),
    );

    const merged = results
      .flat()
      .sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));
    setLogs(merged);
    setLoading(false);
  }, [babyId, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!babyId) return;
    const channels = TABLES.map(({ table }) =>
      supabase
        .channel(`${table}:${babyId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter: `baby_id=eq.${babyId}`,
          },
          fetchLogs,
        )
        .subscribe(),
    );
    return () => channels.forEach((ch) => supabase.removeChannel(ch));
  }, [babyId, fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}
