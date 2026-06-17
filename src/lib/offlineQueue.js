// A tiny localStorage-backed queue of log inserts made while offline. When the
// connection returns we replay them against Supabase. The logs themselves are
// never lost — they wait here. Edit/delete are intentionally NOT queued.

const KEY = "offline_log_queue";
const EVENT = "offline-queue-changed";

export function getQueue() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setQueue(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  // Notify same-tab listeners (the native "storage" event only fires cross-tab).
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function enqueue(item) {
  setQueue([...getQueue(), item]);
}

export function clearQueue() {
  setQueue([]);
}

// Subscribe to queue changes (same tab via custom event, other tabs via storage).
export function subscribeQueue(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Replay queued inserts. Successful ones are dropped; failures stay queued for
// the next attempt. Returns how many flushed and how many remain.
export async function flushQueue(supabase) {
  const queue = getQueue();
  if (queue.length === 0) return { flushed: 0, remaining: 0 };

  const remaining = [];
  let flushed = 0;
  for (const item of queue) {
    const { error } = await supabase.from(item.table).insert(item.row);
    if (error) {
      remaining.push(item);
    } else {
      flushed += 1;
    }
  }
  setQueue(remaining);
  return { flushed, remaining: remaining.length };
}
