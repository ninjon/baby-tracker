import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Renders a single growth metric as a recharts line chart.
 *
 * @param {{ data: object[], dataKey: string, unit: string, label: string, color: string }} props
 */
export default function GrowthChart({ data, dataKey, unit, label, color }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        {label}
      </p>

      {data.length === 0 ? (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--color-border)",
            padding: "20px 16px",
            textAlign: "center",
            color: "var(--color-text-secondary)",
            fontSize: 14,
          }}
        >
          No measurements yet — add one from the log
        </div>
      ) : (
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
            padding: "16px 4px 8px 0",
          }}
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data}
              margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="measured_at"
                tickFormatter={(v) => format(new Date(v), "d MMM")}
                tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}${unit}`}
                tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 13,
                }}
                formatter={(v) => [`${v} ${unit}`, label]}
                labelFormatter={(v) => format(new Date(v), "d MMM yyyy")}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
