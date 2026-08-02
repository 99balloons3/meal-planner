import { useState } from "react";
import { X, Check } from "lucide-react";
import { PHASE_ORDER, PHASES } from "../../lib/cycle";

function RecipeRow({ r, current, onSelect }) {
  return (
    <div
      className="mp-index-card mp-recipe-card"
      style={{ cursor: "pointer", borderColor: current === r.id ? "var(--brick)" : "var(--line)" }}
      onClick={() => onSelect(r.id)}
    >
      <p className="mp-recipe-name">{r.name}</p>
      <p className="mp-recipe-meta">{r.category} · {r.ingredients.length} ingredients</p>
    </div>
  );
}

export default function RecipePickerModal({
  recipes,
  slotLabel,
  current,
  currentQuickAdd,
  phase,
  cycleEnabled,
  onClose,
  onSelect,
  onClear,
  onQuickAdd,
}) {
  const [q, setQ] = useState("");
  const [quickText, setQuickText] = useState(currentQuickAdd?.text || "");
  const [quickPhase, setQuickPhase] = useState(currentQuickAdd?.phaseTag || null);

  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  const suggested = phase ? filtered.filter((r) => (r.phaseTags || []).includes(phase.key)) : [];
  const suggestedIds = new Set(suggested.map((r) => r.id));
  const rest = filtered.filter((r) => !suggestedIds.has(r.id));

  function submitQuickAdd() {
    const text = quickText.trim();
    if (!text) return;
    onQuickAdd(text, quickPhase);
  }

  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2">Choose {slotLabel.toLowerCase()}</div>
        {phase && (
          <p className="mp-sub" style={{ marginTop: -2 }}>
            {phase.emoji} Today is a {phase.label.toLowerCase()} day — phase-friendly picks are surfaced first.
          </p>
        )}

        {(current || currentQuickAdd) && (
          <button className="mp-btn mp-btn-danger" style={{ width: "100%", justifyContent: "center", marginBottom: 14 }} onClick={onClear}>
            <X size={14} /> Clear this meal
          </button>
        )}

        <label className="mp-label">Quick add</label>
        <p className="mp-sub" style={{ marginTop: -2 }}>
          Not a full recipe — just a quick note for this one day, like "banana + peanut butter."
        </p>
        <input
          className="mp-input"
          placeholder="banana + peanut butter"
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitQuickAdd();
            }
          }}
          style={{ marginBottom: 10 }}
        />
        {cycleEnabled && (
          <div className="mp-scrollx" style={{ marginBottom: 10 }}>
            {PHASE_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={`mp-chip herb ${quickPhase === key ? "active" : ""}`}
                onClick={() => setQuickPhase((cur) => (cur === key ? null : key))}
              >
                {PHASES[key].emoji} {PHASES[key].label}
              </button>
            ))}
          </div>
        )}
        <button
          className="mp-btn mp-btn-herb"
          style={{ width: "100%", justifyContent: "center", marginBottom: 18 }}
          onClick={submitQuickAdd}
          disabled={!quickText.trim()}
        >
          <Check size={14} /> Add "{quickText.trim() || "…"}"
        </button>

        <div className="mp-section-header" style={{ marginTop: 0 }}>Or choose a recipe</div>
        <input className="mp-input" placeholder="Search recipes" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-faint)", textAlign: "center", padding: "20px 0" }}>No recipes found.</p>
        ) : (
          <>
            {suggested.length > 0 && (
              <>
                <div className="mp-section-header">
                  {phase.emoji} Suggested for {phase.label.toLowerCase()}
                </div>
                {suggested.map((r) => (
                  <RecipeRow key={r.id} r={r} current={current} onSelect={onSelect} />
                ))}
                <div className="mp-section-header">All recipes</div>
              </>
            )}
            {rest.map((r) => (
              <RecipeRow key={r.id} r={r} current={current} onSelect={onSelect} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
