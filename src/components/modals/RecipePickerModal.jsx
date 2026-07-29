import { useState } from "react";
import { X } from "lucide-react";

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

export default function RecipePickerModal({ recipes, slotLabel, current, phase, onClose, onSelect, onClear }) {
  const [q, setQ] = useState("");
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  const suggested = phase ? filtered.filter((r) => (r.phaseTags || []).includes(phase.key)) : [];
  const suggestedIds = new Set(suggested.map((r) => r.id));
  const rest = filtered.filter((r) => !suggestedIds.has(r.id));

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
        <input className="mp-input" placeholder="Search recipes" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
        {current && (
          <button className="mp-btn mp-btn-danger" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={onClear}>
            <X size={14} /> Clear this meal
          </button>
        )}
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
