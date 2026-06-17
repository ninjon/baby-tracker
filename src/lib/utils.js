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
