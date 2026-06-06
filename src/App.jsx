import { Routes, Route, Navigate } from "react-router-dom";
import { useBaby } from "./context/BabyContext";
import Shell from "./components/Shell";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import History from "./pages/History";
import Health from "./pages/Health";
import More from "./pages/More";

export default function App() {
  const { session, baby, loading } = useBaby();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          color: "var(--color-text-secondary)",
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {!session || !baby ? (
        <Route path="*" element={<Onboarding />} />
      ) : (
        <Route path="/" element={<Shell babyId={baby.id} />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="health" element={<Health />} />
          <Route path="more/*" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
}
