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

export function dayOfLife(dob, today = new Date()) {
  return Math.max(1, differenceInDays(today, dob) + 1);
}

export function pumpExpiry(storage, labelDate) {
  if (storage === "fridge") return addDays(labelDate, 4);
  if (storage === "freezer") return addMonths(labelDate, 6);
  return null;
}

export function computePumpTotal(left, right) {
  return (left ?? 0) + (right ?? 0);
}
