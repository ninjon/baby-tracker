import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getQueue, subscribeQueue } from "../lib/offlineQueue";

// Maps queued (not-yet-synced) inserts for this baby into the same shape as
// server logs, so they show immediately with a `_pending` flag.
function pendingLogsFor(babyId) {
  return getQueue()
    .filter((item) => item.row?.baby_id === babyId)
    .map((item) => ({
      ...item.row,
      id: item.tempId,
      category: item.category,
      sortTime:
        item.row.timestamp ?? item.row.start_time ?? item.row.measured_at,
      _pending: true,
    }));
}

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
  const [, forceQueueTick] = useState(0);

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

  // Re-render when the offline queue changes so pending items appear/clear.
  useEffect(() => subscribeQueue(() => forceQueueTick((n) => n + 1)), []);

  const pending = pendingLogsFor(babyId);
  const allLogs = pending.length
    ? [...pending, ...logs].sort(
        (a, b) => new Date(b.sortTime) - new Date(a.sortTime),
      )
    : logs;

  return { logs: allLogs, loading, refetch: fetchLogs };
}
