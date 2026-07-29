import { Plus, RotateCcw, ShoppingCart, X, Check, Printer, Share2 } from "lucide-react";
import { SECTIONS } from "../lib/constants";

export default function ShoppingTab({
  itemsBySection,
  checked,
  onToggle,
  onRemoveManual,
  onReset,
  checkedCount,
  totalCount,
  onAddItem,
  weekLabel,
  onShare,
}) {
  const nonEmptySections = SECTIONS.filter((s) => itemsBySection[s].length > 0);

  return (
    <div className="mp-section">
      <div className="mp-h2">Shopping list</div>
      <p className="mp-sub">
        For {weekLabel} · {checkedCount}/{totalCount} in cart
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button className="mp-btn" style={{ flex: 1, justifyContent: "center" }} onClick={onAddItem}>
          <Plus size={15} /> Add item
        </button>
        <button className="mp-btn mp-btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={onReset}>
          <RotateCcw size={14} /> Reset list
        </button>
      </div>
      <div className="mp-no-print" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="mp-btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => window.print()}>
          <Printer size={14} /> Print
        </button>
        <button className="mp-btn" style={{ flex: 1, justifyContent: "center" }} onClick={onShare}>
          <Share2 size={14} /> Share
        </button>
      </div>

      <div className="mp-print-only mp-print-header">
        <div className="mp-print-title">The Meal Box — Shopping List</div>
        <div className="mp-print-sub">For {weekLabel}</div>
      </div>

      {totalCount === 0 ? (
        <div className="mp-empty">
          <ShoppingCart size={26} style={{ color: "var(--ink-faint)" }} />
          <p>Plan some meals this week and your ingredients will land here automatically.</p>
        </div>
      ) : (
        nonEmptySections.map((section) => (
          <div key={section}>
            <div className="mp-section-header">{section}</div>
            <div className="mp-index-card" style={{ padding: "2px 14px 2px 30px" }}>
              {itemsBySection[section].map((item) => (
                <div key={item.id} className="mp-check-row">
                  <div className={`mp-checkbox ${checked[item.id] ? "checked" : ""}`} onClick={() => onToggle(item.id)}>
                    {checked[item.id] && <Check size={13} color="#fff" />}
                  </div>
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onToggle(item.id)}>
                    <span
                      style={{
                        fontSize: 14,
                        textDecoration: checked[item.id] ? "line-through" : "none",
                        color: checked[item.id] ? "var(--ink-faint)" : "var(--ink)",
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  {item.qtyLabel && <span className="mp-qty">{item.qtyLabel}</span>}
                  {item.source === "manual" && (
                    <button className="mp-btn-ghost mp-no-print" style={{ color: "var(--ink-faint)" }} onClick={() => onRemoveManual(item.id)} aria-label="Remove item">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
