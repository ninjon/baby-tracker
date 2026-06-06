import { useBaby } from "../../context/BabyContext";
import GrowthChart from "../../components/charts/GrowthChart";
import { useGrowthLogs } from "../../hooks/useGrowthLogs";

const CHARTS = [
  {
    dataKey: "weight_kg",
    unit: "kg",
    label: "Weight (kg)",
    color: "var(--color-accent)",
  },
  { dataKey: "height_cm", unit: "cm", label: "Height (cm)", color: "#6db86d" },
  {
    dataKey: "head_cm",
    unit: "cm",
    label: "Head Circumference (cm)",
    color: "#7eb8d9",
  },
];

export default function GrowthTab() {
  const { baby } = useBaby();
  const { logs, loading } = useGrowthLogs(baby?.id ?? null);

  if (loading) {
    return (
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
        Loading…
      </p>
    );
  }

  return (
    <div>
      {CHARTS.map(({ dataKey, unit, label, color }) => (
        <GrowthChart
          key={dataKey}
          data={logs}
          dataKey={dataKey}
          unit={unit}
          label={label}
          color={color}
        />
      ))}
    </div>
  );
}
