import { useState } from "react";
import { Plus, X, Check, Star } from "lucide-react";
import { CATEGORIES, SECTIONS } from "../../lib/constants";
import { uid } from "../../lib/date";
import { PHASE_ORDER, PHASES } from "../../lib/cycle";

export default function RecipeFormModal({ initial, onClose, onSave, cycleEnabled }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "Dinner");
  const [type, setType] = useState(initial?.type || "single");
  const [prepNotes, setPrepNotes] = useState(initial?.prepNotes || "");
  const [favorite, setFavorite] = useState(initial?.favorite || false);
  const [tags, setTags] = useState(initial?.tags || []);
  const [tagDraft, setTagDraft] = useState("");
  const [phaseTags, setPhaseTags] = useState(initial?.phaseTags || []);
  const [ingredients, setIngredients] = useState(
    initial?.ingredients?.length ? initial.ingredients : [{ id: uid(), name: "", qty: "", unit: "", section: "Produce" }]
  );
  const [steps, setSteps] = useState(
    initial?.type === "multi" && initial?.steps?.length ? initial.steps : type === "multi" ? [""] : []
  );
  const [singleInstructions, setSingleInstructions] = useState(
    initial?.type !== "multi" ? initial?.steps?.[0] || "" : ""
  );

  function updateIngredient(id, field, val) {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: val } : ing)));
  }
  function addIngredientRow() {
    setIngredients([...ingredients, { id: uid(), name: "", qty: "", unit: "", section: "Produce" }]);
  }
  function removeIngredientRow(id) {
    setIngredients(ingredients.filter((i) => i.id !== id));
  }
  function updateStep(i, val) {
    const next = [...steps];
    next[i] = val;
    setSteps(next);
  }
  function addStep() {
    setSteps([...steps, ""]);
  }
  function removeStep(i) {
    setSteps(steps.filter((_, idx) => idx !== i));
  }
  function addTag() {
    const t = tagDraft.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }
  function removeTag(t) {
    setTags(tags.filter((x) => x !== t));
  }
  function togglePhaseTag(key) {
    setPhaseTags((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  function handleSave() {
    if (!name.trim()) return;
    const cleanIngredients = ingredients.filter((i) => i.name.trim());
    const recipe = {
      id: initial?.id,
      name: name.trim(),
      category,
      type,
      prepNotes: prepNotes.trim(),
      favorite,
      tags,
      phaseTags,
      ingredients: cleanIngredients,
      steps: type === "multi" ? steps.filter((s) => s.trim()) : [singleInstructions.trim()],
    };
    onSave(recipe);
  }

  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2">{initial ? "Edit recipe" : "New recipe"}</div>

        <label className="mp-label">Recipe name</label>
        <input className="mp-input" style={{ marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sheet Pan Chicken Fajitas" />

        <div className="mp-form-row">
          <div style={{ flex: 1 }}>
            <label className="mp-label">Category</label>
            <select className="mp-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c !== "Any").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Type</label>
            <select className="mp-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="single">Single-step</option>
              <option value="multi">Multi-step</option>
            </select>
          </div>
        </div>

        <label className="mp-checkbox-inline">
          <span
            className={`mp-checkbox ${favorite ? "checked" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setFavorite((v) => !v)}
          >
            {favorite && <Star size={11} fill="#fff" color="#fff" />}
          </span>
          Mark as favorite
        </label>

        <label className="mp-label" style={{ marginTop: 6 }}>Tags</label>
        <div className="mp-tag-input-row">
          <input
            className="mp-input"
            placeholder="e.g. quick, vegetarian"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button className="mp-btn" onClick={addTag} type="button"><Plus size={14} /></button>
        </div>
        {tags.length > 0 && (
          <div className="mp-recipe-tags" style={{ marginBottom: 14 }}>
            {tags.map((t) => (
              <span key={t} className="mp-tag" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {t}
                <X size={11} style={{ cursor: "pointer" }} onClick={() => removeTag(t)} />
              </span>
            ))}
          </div>
        )}

        {cycleEnabled && (
          <>
            <label className="mp-label">Good for these cycle phases (optional)</label>
            <div className="mp-scrollx" style={{ marginBottom: 14 }}>
              {PHASE_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`mp-chip herb ${phaseTags.includes(key) ? "active" : ""}`}
                  onClick={() => togglePhaseTag(key)}
                >
                  {PHASES[key].emoji} {PHASES[key].label}
                </button>
              ))}
            </div>
          </>
        )}

        <label className="mp-label">Prep notes (optional)</label>
        <textarea className="mp-textarea" style={{ marginBottom: 14 }} rows={2} value={prepNotes} onChange={(e) => setPrepNotes(e.target.value)} placeholder="Marinate the night before…" />

        <label className="mp-label">Ingredients</label>
        {ingredients.map((ing) => (
          <div key={ing.id} className="mp-ing-line">
            <input className="mp-input" style={{ flex: 3 }} placeholder="ingredient" value={ing.name} onChange={(e) => updateIngredient(ing.id, "name", e.target.value)} />
            <input className="mp-input" style={{ flex: 1.2 }} placeholder="qty" value={ing.qty} onChange={(e) => updateIngredient(ing.id, "qty", e.target.value)} />
            <input className="mp-input" style={{ flex: 1.2 }} placeholder="unit" value={ing.unit} onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)} />
            <button className="mp-btn-ghost" onClick={() => removeIngredientRow(ing.id)} aria-label="Remove ingredient" style={{ color: "var(--ink-faint)" }}><X size={16} /></button>
          </div>
        ))}
        <div style={{ marginBottom: 6 }}>
          {ingredients.length > 0 && (
            <select
              className="mp-select"
              style={{ marginBottom: 10 }}
              value={ingredients[ingredients.length - 1].section}
              onChange={(e) => updateIngredient(ingredients[ingredients.length - 1].id, "section", e.target.value)}
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>Grocery section: {s}</option>
              ))}
            </select>
          )}
        </div>
        <button className="mp-btn" onClick={addIngredientRow} style={{ marginBottom: 16 }}><Plus size={14} /> Add ingredient</button>

        {type === "multi" ? (
          <>
            <label className="mp-label">Steps</label>
            {steps.map((s, i) => (
              <div key={i} className="mp-ing-line">
                <span className="mp-step-num" style={{ width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                <input className="mp-input" style={{ flex: 1 }} value={s} onChange={(e) => updateStep(i, e.target.value)} placeholder="Preheat oven to 425°F…" />
                <button className="mp-btn-ghost" onClick={() => removeStep(i)} aria-label="Remove step" style={{ color: "var(--ink-faint)" }}><X size={16} /></button>
              </div>
            ))}
            <button className="mp-btn" onClick={addStep} style={{ marginBottom: 16 }}><Plus size={14} /> Add step</button>
          </>
        ) : (
          <>
            <label className="mp-label">Instructions</label>
            <textarea className="mp-textarea" style={{ marginBottom: 16 }} rows={3} value={singleInstructions} onChange={(e) => setSingleInstructions(e.target.value)} placeholder="Combine everything in a jar and chill overnight." />
          </>
        )}

        <button className="mp-btn mp-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSave} disabled={!name.trim()}>
          <Check size={15} /> {initial ? "Save changes" : "Add recipe"}
        </button>
      </div>
    </div>
  );
}
