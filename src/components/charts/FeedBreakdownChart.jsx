import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  breast: "var(--color-accent)",
  bottle: "#60a5fa",
};

/**
 * @param {{ typeBreakdown: {breast:number, bottle:number} }} props
 */
export default function FeedBreakdownChart({ typeBreakdown }) {
  const data = [
    { name: "Breast", value: typeBreakdown.breast },
    { name: "Bottle", value: typeBreakdown.bottle },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          padding: "8px 0",
        }}
      >
        No feed data for this period.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name.toLowerCase()] ?? "#94a3b8"}
            />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [`${v} feeds`, name]} />
        <Legend iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  );
}
