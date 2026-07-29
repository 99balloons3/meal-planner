import { useState } from "react";
import { X } from "lucide-react";

export default function RecipePickerModal({ recipes, slotLabel, current, onClose, onSelect, onClear }) {
  const [q, setQ] = useState("");
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2">Choose {slotLabel.toLowerCase()}</div>
        <input className="mp-input" placeholder="Search recipes" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
        {current && (
          <button className="mp-btn mp-btn-danger" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={onClear}>
            <X size={14} /> Clear this meal
          </button>
        )}
        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-faint)", textAlign: "center", padding: "20px 0" }}>No recipes found.</p>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="mp-index-card mp-recipe-card"
              style={{ cursor: "pointer", borderColor: current === r.id ? "var(--brick)" : "var(--line)" }}
              onClick={() => onSelect(r.id)}
            >
              <p className="mp-recipe-name">{r.name}</p>
              <p className="mp-recipe-meta">{r.category} · {r.ingredients.length} ingredients</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
