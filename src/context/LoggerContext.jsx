import { createContext, useContext, useState } from "react";

const LOGGERS = ["Darren", "Steffi"];

const LoggerContext = createContext(null);

export function LoggerProvider({ children }) {
  const [logger, setLogger] = useState(
    () => localStorage.getItem("logger") || "Darren",
  );

  function switchLogger(name) {
    localStorage.setItem("logger", name);
    setLogger(name);
  }

  return (
    <LoggerContext.Provider value={{ logger, switchLogger, LOGGERS }}>
      {children}
    </LoggerContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error("useLogger must be used inside LoggerProvider");
  return ctx;
}
