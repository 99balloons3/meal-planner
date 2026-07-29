import { Pencil, Trash2, Star } from "lucide-react";

export default function RecipeDetailModal({ recipe, onClose, onEdit, onDelete, onToggleFavorite }) {
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mp-h2" style={{ marginBottom: 2 }}>{recipe.name}</div>
            <p className="mp-recipe-meta">{recipe.category} · {recipe.type === "multi" ? "multi-step" : "single-step"}</p>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            <button className={`mp-fav-btn ${recipe.favorite ? "active" : ""}`} onClick={() => onToggleFavorite(recipe.id)} aria-label="Toggle favorite">
              <Star size={18} fill={recipe.favorite ? "currentColor" : "none"} />
            </button>
            <button className="mp-btn-ghost" onClick={onEdit} aria-label="Edit recipe"><Pencil size={17} /></button>
            <button className="mp-btn-ghost" onClick={onDelete} aria-label="Delete recipe" style={{ color: "var(--brick)" }}><Trash2 size={17} /></button>
          </div>
        </div>

        {recipe.tags?.length > 0 && (
          <div className="mp-recipe-tags" style={{ marginTop: 8 }}>
            {recipe.tags.map((t) => (
              <span key={t} className="mp-tag">{t}</span>
            ))}
          </div>
        )}

        {recipe.prepNotes && (
          <div className="mp-index-card" style={{ padding: "10px 12px 10px 26px", margin: "12px 0" }}>
            <div className="mp-meal-slot-name" style={{ marginBottom: 3 }}>Prep note</div>
            <div style={{ fontSize: 13.5 }}>{recipe.prepNotes}</div>
          </div>
        )}

        <div className="mp-section-header" style={{ marginTop: 14 }}>Ingredients</div>
        <div className="mp-index-card" style={{ padding: "2px 14px 2px 30px" }}>
          {recipe.ingredients.map((ing) => (
            <div key={ing.id} className="mp-ingredient-row">
              <span>{ing.name}</span>
              <span className="mp-qty">{ing.qty} {ing.unit}</span>
            </div>
          ))}
        </div>

        <div className="mp-section-header">{recipe.type === "multi" ? "Steps" : "Instructions"}</div>
        <div className="mp-index-card" style={{ padding: "12px 14px 12px 30px" }}>
          {recipe.type === "multi" ? (
            recipe.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < recipe.steps.length - 1 ? 10 : 0 }}>
                <span className="mp-step-num">{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 13.5 }}>{s}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 13.5, margin: 0 }}>{recipe.steps[0] || "No instructions added."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
