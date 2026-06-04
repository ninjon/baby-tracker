import { Routes, Route } from "react-router-dom";
import PumpLog from "./PumpLog";

export default function More() {
  return (
    <Routes>
      <Route index element={<MoreMenu />} />
      <Route path="pump" element={<PumpLog />} />
    </Routes>
  );
}

function MoreMenu() {
  return (
    <div style={{ padding: 24 }}>
      <h2>More</h2>
    </div>
  );
}
