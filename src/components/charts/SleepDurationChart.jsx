import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

/**
 * @param {{ data: {date:string, minutes:number}[] }} props
 */
export default function SleepDurationChart({ data }) {
  if (data.length === 0) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          padding: "8px 0",
        }}
      >
        No sleep data for this period.
      </p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "d MMM"),
    hours: Math.round((d.minutes / 60) * 10) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={formatted}
        margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis unit="h" tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v}h`, "Sleep"]} />
        <Bar dataKey="hours" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
