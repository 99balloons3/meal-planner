import { useMemo, useState } from "react";
import { Search, ChefHat, ChevronRight, Star } from "lucide-react";
import { CATEGORIES } from "../lib/constants";

export default function RecipesTab({ recipes, onView, onToggleFavorite }) {
  const [category, setCategory] = useState("Any");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [activeTag, setActiveTag] = useState(null);

  const allTags = useMemo(() => {
    const set = new Set();
    recipes.forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [recipes]);

  const filtered = recipes.filter((r) => {
    const catOk = category === "Any" || r.category === category;
    const searchOk = r.name.toLowerCase().includes(search.toLowerCase());
    const favOk = !favoritesOnly || r.favorite;
    const tagOk = !activeTag || (r.tags || []).includes(activeTag);
    return catOk && searchOk && favOk && tagOk;
  });

  return (
    <div className="mp-section">
      <div className="mp-h2">Recipe database</div>
      <p className="mp-sub">{recipes.length} recipe{recipes.length !== 1 ? "s" : ""} on file</p>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: "var(--ink-faint)" }} />
        <input
          className="mp-input"
          style={{ paddingLeft: 32 }}
          placeholder="Search recipes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mp-scrollx" style={{ marginBottom: 8 }}>
        {CATEGORIES.map((c) => (
          <button key={c} className={`mp-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="mp-scrollx" style={{ marginBottom: 12 }}>
        <button
          className={`mp-chip herb ${favoritesOnly ? "active" : ""}`}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          <Star size={12} fill={favoritesOnly ? "currentColor" : "none"} /> Favorites
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            className={`mp-chip herb ${activeTag === t ? "active" : ""}`}
            onClick={() => setActiveTag((cur) => (cur === t ? null : t))}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mp-empty">
          <ChefHat size={26} style={{ color: "var(--ink-faint)" }} />
          <p>No recipes match yet. Add your first one with the + button.</p>
        </div>
      ) : (
        <div className="mp-recipe-grid">
        {filtered.map((r) => (
          <div key={r.id} className="mp-index-card mp-recipe-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onView(r)}>
                <p className="mp-recipe-name">{r.name}</p>
                <p className="mp-recipe-meta">
                  {r.category} · {r.ingredients.length} ingredients · {r.type === "multi" ? "multi-step" : "single-step"}
                </p>
                {r.tags?.length > 0 && (
                  <div className="mp-recipe-tags">
                    {r.tags.map((t) => (
                      <span key={t} className="mp-tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <button
                  className={`mp-fav-btn ${r.favorite ? "active" : ""}`}
                  onClick={() => onToggleFavorite(r.id)}
                  aria-label="Toggle favorite"
                >
                  <Star size={17} fill={r.favorite ? "currentColor" : "none"} />
                </button>
                <ChevronRight size={16} style={{ color: "var(--ink-faint)", flexShrink: 0, cursor: "pointer" }} onClick={() => onView(r)} />
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
