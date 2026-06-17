import {
  differenceInMinutes,
  differenceInDays,
  addDays,
  addMonths,
} from "date-fns";

export function timeSince(past, now = new Date()) {
  const totalMinutes = differenceInMinutes(now, past);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Returns "Day N" after birth, or "Xd to go" before birth
export function dayOfLife(dob, today = new Date()) {
  const days = differenceInDays(today, dob);
  if (days < 0) return `${Math.abs(days)}d to go`;
  return `Day ${days + 1}`;
}

export function pumpExpiry(storage, labelDate) {
  if (storage === "fridge") return addDays(labelDate, 4);
  if (storage === "freezer") return addMonths(labelDate, 6);
  return null;
}

export function computePumpTotal(left, right) {
  return (left ?? 0) + (right ?? 0);
}

// Rolls up today's feeds, diaper counts, and bottle volume from the merged
// log list (each entry has a `category` and `timestamp`). Used for the Home
// "Today" summary card and the doctor-visit export.
export function summarizeToday(logs, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  let feeds = 0;
  let wet = 0;
  let dirty = 0;
  let bottleMl = 0;

  for (const log of logs) {
    if (!log.timestamp) continue;
    if (new Date(log.timestamp) < start) continue;

    if (log.category === "feeding") {
      feeds += 1;
      if (log.type === "bottle" && log.amount_ml) bottleMl += log.amount_ml;
    } else if (log.category === "diaper") {
      if (log.type === "wet" || log.type === "both") wet += 1;
      if (log.type === "dirty" || log.type === "both") dirty += 1;
    }
  }

  return { feeds, wet, dirty, bottleMl };
}

// Local (not UTC) yyyy-MM-dd key so a log counts toward the calendar day it
// happened on in the user's timezone.
function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Per-day rollups for the last `days` days (today first), used by the
// doctor-visit export. Each row: { date, feeds, bottleMl, wet, dirty,
// sleepMinutes }. Sleep is bucketed by start_time; only completed sleeps count.
export function summarizeRange(logs, days = 7, now = new Date()) {
  const buckets = {};
  const order = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    order.push(key);
    buckets[key] = {
      date: key,
      feeds: 0,
      bottleMl: 0,
      wet: 0,
      dirty: 0,
      sleepMinutes: 0,
    };
  }

  for (const log of logs) {
    const when = log.category === "sleep" ? log.start_time : log.timestamp;
    if (!when) continue;
    const bucket = buckets[localDateKey(new Date(when))];
    if (!bucket) continue;

    if (log.category === "feeding") {
      bucket.feeds += 1;
      if (log.type === "bottle" && log.amount_ml)
        bucket.bottleMl += log.amount_ml;
    } else if (log.category === "diaper") {
      if (log.type === "wet" || log.type === "both") bucket.wet += 1;
      if (log.type === "dirty" || log.type === "both") bucket.dirty += 1;
    } else if (log.category === "sleep" && log.duration_minutes) {
      bucket.sleepMinutes += log.duration_minutes;
    }
  }

  return order.map((key) => buckets[key]);
}

// Suggests which breast to start on next, based on the most recent breast feed.
// Returns "left" | "right", or null when there's no clear suggestion (no prior
// breast feed, or the last one was "both"). Assumes logs are newest-first.
export function nextBreastSide(logs) {
  const lastBreast = logs.find(
    (log) => log.category === "feeding" && log.type === "breast" && log.side,
  );
  if (!lastBreast) return null;
  if (lastBreast.side === "left") return "right";
  if (lastBreast.side === "right") return "left";
  return null;
}
