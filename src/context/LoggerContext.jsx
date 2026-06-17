import { createContext, useContext, useState } from "react";

const DEFAULT_CAREGIVERS = ["Darren", "Steffi"];

// The caregiver list is the set of names you can log "as". It's stored per
// device in localStorage (not the DB) — the logs themselves already carry
// logged_by_name, so attribution is preserved everywhere; only the editable
// picker list is device-local.
function loadCaregivers() {
  try {
    const raw = localStorage.getItem("caregivers");
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((n) => typeof n === "string" && n.trim());
    }
  } catch {
    // malformed storage — fall back to defaults
  }
  return DEFAULT_CAREGIVERS;
}

const LoggerContext = createContext(null);

export function LoggerProvider({ children }) {
  const [caregivers, setCaregivers] = useState(loadCaregivers);
  const [logger, setLogger] = useState(
    () => localStorage.getItem("logger") || loadCaregivers()[0],
  );

  function persistCaregivers(next) {
    localStorage.setItem("caregivers", JSON.stringify(next));
    setCaregivers(next);
  }

  function switchLogger(name) {
    localStorage.setItem("logger", name);
    setLogger(name);
  }

  function addCaregiver(name) {
    const clean = (name ?? "").trim();
    if (!clean || caregivers.includes(clean)) return;
    persistCaregivers([...caregivers, clean]);
  }

  function removeCaregiver(name) {
    if (caregivers.length <= 1) return; // always keep at least one
    const next = caregivers.filter((c) => c !== name);
    persistCaregivers(next);
    if (logger === name) switchLogger(next[0]);
  }

  return (
    <LoggerContext.Provider
      value={{
        logger,
        switchLogger,
        caregivers,
        addCaregiver,
        removeCaregiver,
        // Backwards-compatible alias used by the Home logger switcher.
        LOGGERS: caregivers,
      }}
    >
      {children}
    </LoggerContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error("useLogger must be used inside LoggerProvider");
  return ctx;
}
