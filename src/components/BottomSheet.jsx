import { useEffect } from "react";

export default function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div
        data-testid="sheet-backdrop"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(26,24,20,0.45)",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--color-bg)",
          borderRadius: "var(--radius-sheet) var(--radius-sheet) 0 0",
          animation: "slideUp 200ms ease-out",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <div
            style={{
              width: 36,
              height: 4,
              background: "var(--color-border)",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </div>
        {children}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
