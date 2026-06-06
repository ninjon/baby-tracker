import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";

/**
 * Displays the longest sleep stretch per day.
 *
 * @param {{ data: {date:string, minutes:number}[], longestStretchMinutes: number }} props
 */
export default function SleepTimeChart({ data, longestStretchMinutes }) {
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
    <>
      {longestStretchMinutes > 0 && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 8,
          }}
        >
          Longest stretch:{" "}
          <strong>{Math.round((longestStretchMinutes / 60) * 10) / 10}h</strong>
        </p>
      )}
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart
          data={formatted}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis unit="h" tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v}h`, "Total"]} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
}
