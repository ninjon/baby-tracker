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
 * @param {{ data: {date:string, amount_ml:number}[] }} props
 */
export default function FeedAmountChart({ data }) {
  if (data.length === 0) {
    return (
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          padding: "8px 0",
        }}
      >
        No bottle feed data for this period.
      </p>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "d MMM"),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={formatted}
        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis unit="ml" tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v} ml`, "Bottle"]} />
        <Bar dataKey="amount_ml" fill="#60a5fa" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
