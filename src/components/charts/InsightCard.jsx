/**
 * Wraps a chart in a titled card using the project's design tokens.
 *
 * @param {{ title: string, subtitle?: string, children: React.ReactNode }} props
 */
export default function InsightCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: "16px 16px 12px",
        marginBottom: 20,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 15,
          fontWeight: 400,
          color: "var(--color-text-primary)",
          marginBottom: subtitle ? 2 : 12,
        }}
      >
        {title}
      </p>

      {subtitle && (
        <p
          data-testid="insight-subtitle"
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            marginBottom: 12,
          }}
        >
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}
