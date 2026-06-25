import { useState, useCallback } from "react";

function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function cacheKey(babyId) {
  return `ai-summary:${babyId}:${todayKey()}`;
}

function readCachedSummary(babyId) {
  if (!babyId) return "";
  try {
    const raw = localStorage.getItem(cacheKey(babyId));
    return raw ? JSON.parse(raw).summary || "" : "";
  } catch {
    return "";
  }
}

// On-demand AI summary with same-day caching. generate() calls the serverless
// /api/insights endpoint; the result is cached per baby per day so re-opening
// the tab (or this device) doesn't spend another Claude call.
export function useAiSummary(babyId) {
  const [summary, setSummary] = useState(() => readCachedSummary(babyId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(
    async (stats) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ stats }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.summary) {
          throw new Error(
            data.error || "Couldn't generate a summary right now.",
          );
        }
        setSummary(data.summary);
        try {
          localStorage.setItem(
            cacheKey(babyId),
            JSON.stringify({ summary: data.summary, at: Date.now() }),
          );
        } catch {
          // storage full / unavailable — non-fatal
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [babyId],
  );

  return { summary, loading, error, generate };
}
