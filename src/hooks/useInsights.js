import { useCallback, useEffect, useState } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { supabase } from "../lib/supabase";

// ─── Pure aggregation helpers (exported for unit testing) ─────────────────────

/**
 * @param {object[]} logs  — sleep_logs rows
 * @returns {{ dailyTotals: {date:string, minutes:number}[], longestStretchMinutes: number, avgMinutesPerDay: number }}
 */
export function aggregateSleepByDay(logs) {
  if (logs.length === 0) {
    return { dailyTotals: [], longestStretchMinutes: 0, avgMinutesPerDay: 0 };
  }

  const byDay = {};
  let longest = 0;

  for (const log of logs) {
    const date = format(startOfDay(new Date(log.start_time)), "yyyy-MM-dd");
    byDay[date] = (byDay[date] ?? 0) + (log.duration_minutes ?? 0);
    if ((log.duration_minutes ?? 0) > longest) longest = log.duration_minutes;
  }

  const dailyTotals = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, minutes]) => ({ date, minutes }));

  const avgMinutesPerDay =
    dailyTotals.reduce((s, d) => s + d.minutes, 0) / dailyTotals.length;

  return {
    dailyTotals,
    longestStretchMinutes: longest,
    avgMinutesPerDay: Math.round(avgMinutesPerDay),
  };
}

/**
 * @param {object[]} logs  — feeding_logs rows
 * @returns {{ dailyAmounts: {date:string, amount_ml:number}[], typeBreakdown: {breast:number, bottle:number}, feedsPerDay: number, avgMlPerBottleFeed: number }}
 */
export function aggregateFeedByDay(logs) {
  if (logs.length === 0) {
    return {
      dailyAmounts: [],
      typeBreakdown: { breast: 0, bottle: 0 },
      feedsPerDay: 0,
      avgMlPerBottleFeed: 0,
    };
  }

  const byDay = {};
  const typeBreakdown = { breast: 0, bottle: 0 };
  let totalBottleMl = 0;
  let bottleCount = 0;
  const days = new Set();

  for (const log of logs) {
    const date = format(startOfDay(new Date(log.timestamp)), "yyyy-MM-dd");
    days.add(date);

    if (log.type === "bottle") {
      const ml = log.amount_ml ?? 0;
      byDay[date] = (byDay[date] ?? 0) + ml;
      totalBottleMl += ml;
      bottleCount += 1;
      typeBreakdown.bottle += 1;
    } else if (log.type === "breast") {
      typeBreakdown.breast += 1;
    }
  }

  const dailyAmounts = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount_ml]) => ({ date, amount_ml }));

  const feedsPerDay = logs.length / days.size;
  const avgMlPerBottleFeed = bottleCount > 0 ? totalBottleMl / bottleCount : 0;

  return {
    dailyAmounts,
    typeBreakdown,
    feedsPerDay: Math.round(feedsPerDay * 10) / 10,
    avgMlPerBottleFeed: Math.round(avgMlPerBottleFeed * 10) / 10,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSleepInsights(babyId, days = 14) {
  const [state, setState] = useState({
    dailyTotals: [],
    longestStretchMinutes: 0,
    avgMinutesPerDay: 0,
    loading: true,
  });

  const fetch = useCallback(async () => {
    if (!babyId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true }));

    const since = subDays(new Date(), days).toISOString();
    const { data } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("baby_id", babyId)
      .gte("start_time", since)
      .order("start_time", { ascending: true });

    setState({ ...aggregateSleepByDay(data ?? []), loading: false });
  }, [babyId, days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return state;
}

export function useFeedInsights(babyId, days = 14) {
  const [state, setState] = useState({
    dailyAmounts: [],
    typeBreakdown: { breast: 0, bottle: 0 },
    feedsPerDay: 0,
    avgMlPerBottleFeed: 0,
    loading: true,
  });

  const fetch = useCallback(async () => {
    if (!babyId) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true }));

    const since = subDays(new Date(), days).toISOString();
    const { data } = await supabase
      .from("feeding_logs")
      .select("*")
      .eq("baby_id", babyId)
      .gte("timestamp", since)
      .order("timestamp", { ascending: true });

    setState({ ...aggregateFeedByDay(data ?? []), loading: false });
  }, [babyId, days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return state;
}
