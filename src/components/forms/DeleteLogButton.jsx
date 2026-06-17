// Shared "Delete entry" button shown at the bottom of a log form when it is
// opened in edit mode (an `onDelete` handler is provided). Confirms first.
export default function DeleteLogButton({ onDelete }) {
  if (!onDelete) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Delete this entry? This can't be undone.")) {
          onDelete();
        }
      }}
      style={{
        width: "100%",
        marginTop: 10,
        padding: 13,
        background: "none",
        color: "var(--color-danger)",
        border: "1.5px solid var(--color-danger)",
        borderRadius: "var(--radius-button)",
        fontSize: 14,
        fontWeight: 700,
        minHeight: "var(--tap-min-height)",
        cursor: "pointer",
      }}
    >
      Delete entry
    </button>
  );
}
