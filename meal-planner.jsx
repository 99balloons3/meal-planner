import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar, BookOpen, ShoppingCart, Plus, X, Check, ChevronLeft, ChevronRight,
  Search, Trash2, Pencil, ChefHat, RotateCcw, Coffee, Sun, Moon, Cookie, NotebookPen
} from "lucide-react";

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');";

const CSS = `
${FONT_IMPORT}
:root{
  --paper:#EEF0E2;
  --card:#FFFDF8;
  --ink:#262B22;
  --ink-soft:#5C6350;
  --ink-faint:#8A8F7C;
  --line:#D7D9C8;
  --line-strong:#C2C6AE;
  --mustard:#C1841C;
  --mustard-deep:#8F6212;
  --brick:#A8432A;
  --brick-deep:#7C3120;
  --herb:#4C6B45;
  --herb-deep:#37501F;
  --herb-bg:#E4EBDA;
  --mustard-bg:#F6E9CD;
  --brick-bg:#F3DFD8;
  --radius:14px;
  --font-display:'Fraunces', serif;
  --font-body:'Inter', sans-serif;
  --font-mono:'IBM Plex Mono', monospace;
}
.mp-root{
  font-family:var(--font-body);
  color:var(--ink);
  background:var(--paper);
  min-height:100vh;
  max-width:480px;
  margin:0 auto;
  position:relative;
  padding-bottom:84px;
  -webkit-font-smoothing:antialiased;
}
.mp-root *{box-sizing:border-box;}
.mp-root button{font-family:var(--font-body);cursor:pointer;}
.mp-root input, .mp-root textarea, .mp-root select{font-family:var(--font-body);}
.mp-header{
  padding:20px 18px 14px;
  display:flex;
  align-items:baseline;
  justify-content:space-between;
}
.mp-brand{
  font-family:var(--font-display);
  font-weight:600;
  font-size:22px;
  letter-spacing:-0.01em;
  color:var(--ink);
  display:flex;
  align-items:center;
  gap:8px;
}
.mp-brand-mark{
  width:9px;height:9px;border-radius:2px;background:var(--brick);
  transform:rotate(45deg);
  display:inline-block;
}
.mp-tagline{font-size:11px;color:var(--ink-faint);font-family:var(--font-mono);letter-spacing:0.02em;}
.mp-index-card{
  background:var(--card);
  border-radius:12px;
  border:1px solid var(--line);
  position:relative;
  box-shadow:0 1px 0 rgba(38,43,34,0.03);
}
.mp-index-card::before{
  content:'';
  position:absolute;
  left:22px;top:0;bottom:0;
  width:1px;
  background:var(--brick);
  opacity:0.25;
}
.mp-index-card::after{
  content:'';
  position:absolute;
  left:12px;top:16px;
  width:6px;height:6px;
  border-radius:50%;
  background:var(--paper);
  border:1px solid var(--line-strong);
  box-shadow:0 44px 0 var(--paper), 0 44px 0 1px var(--line-strong);
}
.mp-tabbar{
  position:fixed;
  bottom:0;left:0;right:0;
  max-width:480px;
  margin:0 auto;
  background:var(--card);
  border-top:1px solid var(--line);
  display:flex;
  padding:8px 8px calc(8px + env(safe-area-inset-bottom));
  gap:4px;
  z-index:40;
}
.mp-tab{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:3px;
  padding:6px 4px;
  border:none;
  background:transparent;
  border-radius:10px;
  color:var(--ink-faint);
  font-size:11px;
  font-weight:500;
  transition:background 0.15s, color 0.15s;
}
.mp-tab.active{color:var(--brick-deep);background:var(--brick-bg);}
.mp-section{padding:0 16px 20px;}
.mp-h2{
  font-family:var(--font-display);
  font-weight:600;
  font-size:19px;
  margin:0 0 4px;
  color:var(--ink);
}
.mp-sub{font-size:12.5px;color:var(--ink-soft);margin:0 0 14px;}
.mp-btn{
  border:1px solid var(--line-strong);
  background:var(--card);
  border-radius:10px;
  padding:9px 14px;
  font-size:13px;
  font-weight:500;
  color:var(--ink);
  display:inline-flex;
  align-items:center;
  gap:6px;
  transition:transform 0.1s, background 0.15s;
}
.mp-btn:active{transform:scale(0.97);}
.mp-btn-primary{
  background:var(--mustard);
  border-color:var(--mustard-deep);
  color:#fff;
}
.mp-btn-ghost{border-color:transparent;background:transparent;padding:6px 8px;}
.mp-btn-danger{color:var(--brick-deep);border-color:var(--brick);background:var(--brick-bg);}
.mp-input, .mp-select, .mp-textarea{
  width:100%;
  border:1px solid var(--line-strong);
  background:#fff;
  border-radius:9px;
  padding:9px 11px;
  font-size:14px;
  color:var(--ink);
  outline:none;
}
.mp-input:focus, .mp-select:focus, .mp-textarea:focus{border-color:var(--mustard);}
.mp-textarea{resize:vertical;min-height:56px;font-family:var(--font-body);}
.mp-label{font-size:11.5px;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:5px;display:block;}
.mp-badge{
  font-size:10.5px;
  font-weight:600;
  padding:3px 8px;
  border-radius:20px;
  display:inline-block;
  letter-spacing:0.01em;
}
.mp-scrollx{display:flex;overflow-x:auto;gap:8px;padding:2px 0 6px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.mp-scrollx::-webkit-scrollbar{display:none;}
.mp-daypill{
  flex:0 0 auto;
  padding:9px 6px 8px;
  border-radius:12px;
  border:1px solid var(--line);
  background:var(--card);
  min-width:52px;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:2px;
}
.mp-daypill.selected{border-color:var(--brick);background:var(--brick-bg);}
.mp-daypill .dname{font-size:10px;color:var(--ink-faint);font-weight:600;letter-spacing:0.03em;}
.mp-daypill.selected .dname{color:var(--brick-deep);}
.mp-daypill .dnum{font-family:var(--font-display);font-size:16px;font-weight:600;}
.mp-dot-row{display:flex;gap:3px;margin-top:1px;}
.mp-dot{width:4px;height:4px;border-radius:50%;background:var(--line-strong);}
.mp-dot.filled{background:var(--herb);}
.mp-meal-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px 0;
  border-bottom:1px solid var(--line);
}
.mp-meal-row:last-child{border-bottom:none;}
.mp-meal-icon{
  width:30px;height:30px;
  border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  background:var(--paper);
  color:var(--ink-soft);
  flex-shrink:0;
}
.mp-meal-slot-name{font-size:10.5px;font-weight:600;color:var(--ink-faint);text-transform:uppercase;letter-spacing:0.04em;}
.mp-meal-slot-value{font-size:14.5px;font-weight:500;color:var(--ink);margin-top:1px;}
.mp-meal-slot-empty{font-size:13.5px;color:var(--ink-faint);font-style:italic;margin-top:1px;}
.mp-modal-backdrop{
  position:fixed;inset:0;
  background:rgba(38,43,34,0.4);
  display:flex;align-items:flex-end;
  z-index:100;
  max-width:480px;
  margin:0 auto;
}
.mp-modal{
  background:var(--paper);
  width:100%;
  max-height:86vh;
  border-radius:20px 20px 0 0;
  padding:16px 18px calc(20px + env(safe-area-inset-bottom));
  overflow-y:auto;
  animation:mp-slideup 0.2s ease-out;
}
@keyframes mp-slideup{from{transform:translateY(24px);opacity:0.6;}to{transform:translateY(0);opacity:1;}}
.mp-modal-handle{width:36px;height:4px;background:var(--line-strong);border-radius:4px;margin:0 auto 14px;}
.mp-recipe-card{
  padding:14px 14px 14px 30px;
  margin-bottom:10px;
  position:relative;
}
.mp-recipe-name{font-family:var(--font-display);font-weight:600;font-size:16px;margin:0 0 3px;}
.mp-recipe-meta{font-size:11.5px;color:var(--ink-faint);font-family:var(--font-mono);}
.mp-ingredient-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px;
}
.mp-ingredient-row:last-child{border-bottom:none;}
.mp-qty{font-family:var(--font-mono);font-size:12.5px;color:var(--ink-soft);white-space:nowrap;padding-left:10px;}
.mp-section-header{
  font-size:11.5px;font-weight:700;color:var(--herb-deep);
  text-transform:uppercase;letter-spacing:0.05em;
  margin:16px 0 6px;
  display:flex;align-items:center;gap:6px;
}
.mp-check-row{
  display:flex;align-items:center;gap:11px;
  padding:10px 0;border-bottom:1px solid var(--line);
}
.mp-check-row:last-child{border-bottom:none;}
.mp-checkbox{
  width:20px;height:20px;border-radius:6px;
  border:1.5px solid var(--line-strong);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;background:#fff;
}
.mp-checkbox.checked{background:var(--herb);border-color:var(--herb-deep);}
.mp-empty{
  text-align:center;padding:38px 20px;color:var(--ink-faint);
}
.mp-empty p{font-size:13px;margin:6px 0 0;}
.mp-widget-row{display:flex;gap:10px;margin-bottom:14px;}
.mp-widget-stat{
  flex:1;padding:12px 12px;
  text-align:center;
}
.mp-widget-num{font-family:var(--font-display);font-size:22px;font-weight:600;color:var(--ink);}
.mp-widget-label{font-size:10px;color:var(--ink-faint);font-weight:600;text-transform:uppercase;letter-spacing:0.03em;margin-top:1px;}
.mp-chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 10px;border-radius:20px;
  font-size:12px;font-weight:500;
  border:1px solid var(--line-strong);background:#fff;
}
.mp-chip.active{background:var(--mustard);color:#fff;border-color:var(--mustard-deep);}
.mp-fab{
  position:fixed;
  bottom:92px;right:calc(50% - 240px + 18px);
  width:52px;height:52px;
  border-radius:50%;
  background:var(--brick);
  color:#fff;
  display:flex;align-items:center;justify-content:center;
  border:none;
  box-shadow:0 3px 10px rgba(168,67,42,0.35);
  z-index:41;
}
@media (max-width:480px){
  .mp-fab{right:18px;}
}
.mp-step-num{
  font-family:var(--font-mono);
  font-size:11px;color:var(--brick);font-weight:600;
}
.mp-week-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mp-week-label{font-family:var(--font-mono);font-size:12.5px;color:var(--ink-soft);}
.mp-arrow-btn{
  width:30px;height:30px;border-radius:8px;
  border:1px solid var(--line-strong);background:var(--card);
  display:flex;align-items:center;justify-content:center;color:var(--ink-soft);
}
.mp-ing-line{display:flex;gap:6px;margin-bottom:6px;align-items:center;}
`;

const SECTIONS = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery & Grains", "Pantry", "Frozen", "Other"];
const MEAL_SLOTS = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Sun },
  { key: "dinner", label: "Dinner", icon: Moon },
  { key: "snack", label: "Snack", icon: Cookie },
];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Any"];

function uid() { return Math.random().toString(36).slice(2, 10); }

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function fmtISO(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtRange(monday) {
  const sunday = addDays(monday, 6);
  const opts = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString("en-US", opts)} – ${sunday.toLocaleDateString("en-US", opts)}`;
}
function fmtShort(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }

const STARTER_RECIPES = [
  {
    id: uid(), name: "Overnight Oats", category: "Breakfast", type: "single", prepNotes: "Make in mason jars the night before — grab and go.",
    ingredients: [
      { id: uid(), name: "rolled oats", qty: "1", unit: "cup", section: "Pantry" },
      { id: uid(), name: "milk", qty: "1", unit: "cup", section: "Dairy & Eggs" },
      { id: uid(), name: "greek yogurt", qty: "0.5", unit: "cup", section: "Dairy & Eggs" },
      { id: uid(), name: "honey", qty: "1", unit: "tbsp", section: "Pantry" },
      { id: uid(), name: "blueberries", qty: "0.5", unit: "cup", section: "Produce" },
    ],
    steps: ["Combine oats, milk, yogurt, and honey in a jar.", "Stir well and top with blueberries.", "Cover and refrigerate overnight."],
  },
  {
    id: uid(), name: "Sheet Pan Chicken Fajitas", category: "Dinner", type: "multi", prepNotes: "Slice peppers and onions ahead on Sunday.",
    ingredients: [
      { id: uid(), name: "chicken breast", qty: "1.5", unit: "lb", section: "Meat & Seafood" },
      { id: uid(), name: "bell peppers", qty: "3", unit: "", section: "Produce" },
      { id: uid(), name: "yellow onion", qty: "1", unit: "", section: "Produce" },
      { id: uid(), name: "flour tortillas", qty: "8", unit: "", section: "Bakery & Grains" },
      { id: uid(), name: "fajita seasoning", qty: "2", unit: "tbsp", section: "Pantry" },
      { id: uid(), name: "olive oil", qty: "2", unit: "tbsp", section: "Pantry" },
    ],
    steps: ["Preheat oven to 425°F.", "Slice chicken and vegetables into strips.", "Toss with oil and seasoning on a sheet pan.", "Roast 20–22 minutes, tossing halfway.", "Serve with warm tortillas."],
  },
  {
    id: uid(), name: "Big Salad with Chickpeas", category: "Lunch", type: "single", prepNotes: "",
    ingredients: [
      { id: uid(), name: "romaine lettuce", qty: "1", unit: "head", section: "Produce" },
      { id: uid(), name: "chickpeas", qty: "1", unit: "can", section: "Pantry" },
      { id: uid(), name: "cherry tomatoes", qty: "1", unit: "cup", section: "Produce" },
      { id: uid(), name: "feta cheese", qty: "0.33", unit: "cup", section: "Dairy & Eggs" },
      { id: uid(), name: "cucumber", qty: "1", unit: "", section: "Produce" },
    ],
    steps: ["Chop lettuce, tomatoes, and cucumber.", "Drain and rinse chickpeas.", "Toss everything together with feta and your favorite dressing."],
  },
];

export default function MealPlanner() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("plan");
  const [recipes, setRecipes] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [plan, setPlan] = useState({});
  const [shopping, setShopping] = useState({ manual: [], checked: {} });
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [pickerSlot, setPickerSlot] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [recipeFilter, setRecipeFilter] = useState("Any");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [toast, setToast] = useState("");
  const loadedOnce = useRef(false);

  const weekKey = fmtISO(weekStart);

  useEffect(() => {
    (async () => {
      try {
        let r;
        try { r = await window.storage.get("recipes"); } catch (e) { r = null; }
        if (r && r.value) {
          setRecipes(JSON.parse(r.value));
        } else {
          setRecipes(STARTER_RECIPES);
          await window.storage.set("recipes", JSON.stringify(STARTER_RECIPES));
        }
      } catch (e) {
        setRecipes(STARTER_RECIPES);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        let p;
        try { p = await window.storage.get(`plan:${weekKey}`); } catch (e) { p = null; }
        setPlan(p && p.value ? JSON.parse(p.value) : {});
      } catch (e) { setPlan({}); }
      try {
        let s;
        try { s = await window.storage.get(`shopping:${weekKey}`); } catch (e) { s = null; }
        setShopping(s && s.value ? JSON.parse(s.value) : { manual: [], checked: {} });
      } catch (e) { setShopping({ manual: [], checked: {} }); }
    })();
  }, [weekKey, ready]);

  const saveRecipes = useCallback(async (next) => {
    setRecipes(next);
    try { await window.storage.set("recipes", JSON.stringify(next)); } catch (e) {}
  }, []);
  const savePlan = useCallback(async (next) => {
    setPlan(next);
    try { await window.storage.set(`plan:${weekKey}`, JSON.stringify(next)); } catch (e) {}
  }, [weekKey]);
  const saveShopping = useCallback(async (next) => {
    setShopping(next);
    try { await window.storage.set(`shopping:${weekKey}`, JSON.stringify(next)); } catch (e) {}
  }, [weekKey]);

  function flashToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayDates = days.map(fmtISO);

  function getDayPlan(dateStr) {
    return plan[dateStr] || { breakfast: null, lunch: null, dinner: null, snack: null, note: "" };
  }

  function setMeal(dateStr, slotKey, recipeId) {
    const next = { ...plan };
    next[dateStr] = { ...getDayPlan(dateStr), [slotKey]: recipeId };
    savePlan(next);
  }

  function setDayNote(dateStr, note) {
    const next = { ...plan };
    next[dateStr] = { ...getDayPlan(dateStr), note };
    savePlan(next);
  }

  function recipeById(id) { return recipes.find((r) => r.id === id); }

  // shopping list generation
  function buildAutoItems() {
    const map = {};
    dayDates.forEach((dateStr) => {
      const dp = getDayPlan(dateStr);
      MEAL_SLOTS.forEach((slot) => {
        const rid = dp[slot.key];
        if (!rid) return;
        const recipe = recipeById(rid);
        if (!recipe) return;
        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.trim().toLowerCase()}|${ing.unit || ""}`;
          if (!map[key]) {
            map[key] = { id: key, name: ing.name, unit: ing.unit, section: ing.section || "Other", qty: 0, qtyParts: [] };
          }
          const n = parseFloat(ing.qty);
          if (!isNaN(n)) map[key].qty += n;
          else map[key].qtyParts.push(ing.qty);
        });
      });
    });
    return Object.values(map).map((it) => {
      let qtyLabel = "";
      if (it.qty > 0) qtyLabel = `${parseFloat(it.qty.toFixed(2))}${it.unit ? " " + it.unit : ""}`;
      if (it.qtyParts.length) qtyLabel = [qtyLabel, ...it.qtyParts].filter(Boolean).join(" + ");
      return { ...it, qtyLabel };
    });
  }

  const autoItems = buildAutoItems();
  const allItems = [
    ...autoItems.map((it) => ({ ...it, source: "auto" })),
    ...shopping.manual.map((it) => ({ ...it, source: "manual" })),
  ];
  const itemsBySection = {};
  SECTIONS.forEach((s) => (itemsBySection[s] = []));
  allItems.forEach((it) => {
    const sec = SECTIONS.includes(it.section) ? it.section : "Other";
    itemsBySection[sec].push(it);
  });

  function toggleChecked(itemId) {
    const next = { ...shopping, checked: { ...shopping.checked, [itemId]: !shopping.checked[itemId] } };
    saveShopping(next);
  }

  function addManualItem(name, qty, section) {
    if (!name.trim()) return;
    const item = { id: uid(), name: name.trim(), unit: "", section, qtyLabel: qty };
    const next = { ...shopping, manual: [...shopping.manual, item] };
    saveShopping(next);
  }
  function removeManualItem(id) {
    const next = { ...shopping, manual: shopping.manual.filter((i) => i.id !== id) };
    saveShopping(next);
  }
  function resetShoppingList() {
    saveShopping({ manual: [], checked: {} });
    flashToast("Shopping list reset");
  }

  const totalSlots = 7 * MEAL_SLOTS.length;
  const filledSlots = dayDates.reduce((sum, d) => {
    const dp = getDayPlan(d);
    return sum + MEAL_SLOTS.filter((s) => dp[s.key]).length;
  }, 0);
  const checkedCount = allItems.filter((i) => shopping.checked[i.id]).length;

  const filteredRecipes = recipes.filter((r) => {
    const catOk = recipeFilter === "Any" || r.category === recipeFilter;
    const searchOk = r.name.toLowerCase().includes(recipeSearch.toLowerCase());
    return catOk && searchOk;
  });

  function deleteRecipe(id) {
    saveRecipes(recipes.filter((r) => r.id !== id));
    setViewingRecipe(null);
    flashToast("Recipe deleted");
  }

  if (!ready) {
    return (
      <div className="mp-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <style>{CSS}</style>
        <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>Loading your kitchen…</p>
      </div>
    );
  }

  return (
    <div className="mp-root">
      <style>{CSS}</style>

      <div className="mp-header">
        <div>
          <div className="mp-brand"><span className="mp-brand-mark" />The Meal Box</div>
          <div className="mp-tagline">weekly plans · shopping · recipes</div>
        </div>
      </div>

      {tab === "plan" && (
        <PlanTab
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          days={days}
          dayDates={dayDates}
          selectedDayIdx={selectedDayIdx}
          setSelectedDayIdx={setSelectedDayIdx}
          getDayPlan={getDayPlan}
          recipeById={recipeById}
          filledSlots={filledSlots}
          totalSlots={totalSlots}
          onOpenPicker={(dateStr, slotKey) => setPickerSlot({ dateStr, slotKey })}
          onOpenNote={(dateStr) => {
            setNoteDraft(getDayPlan(dateStr).note || "");
            setShowNoteModal(dateStr);
          }}
        />
      )}

      {tab === "recipes" && (
        <RecipesTab
          recipes={filteredRecipes}
          recipeFilter={recipeFilter}
          setRecipeFilter={setRecipeFilter}
          recipeSearch={recipeSearch}
          setRecipeSearch={setRecipeSearch}
          onView={(r) => setViewingRecipe(r)}
          onAdd={() => { setEditingRecipe(null); setShowRecipeForm(true); }}
        />
      )}

      {tab === "shopping" && (
        <ShoppingTab
          itemsBySection={itemsBySection}
          checked={shopping.checked}
          onToggle={toggleChecked}
          onRemoveManual={removeManualItem}
          onReset={resetShoppingList}
          checkedCount={checkedCount}
          totalCount={allItems.length}
          onAddItem={() => setShowAddItem(true)}
          weekLabel={fmtRange(weekStart)}
        />
      )}

      {tab === "recipes" && (
        <button className="mp-fab" onClick={() => { setEditingRecipe(null); setShowRecipeForm(true); }} aria-label="Add recipe">
          <Plus size={24} />
        </button>
      )}

      <nav className="mp-tabbar">
        <button className={`mp-tab ${tab === "plan" ? "active" : ""}`} onClick={() => setTab("plan")}>
          <Calendar size={19} /> Plan
        </button>
        <button className={`mp-tab ${tab === "recipes" ? "active" : ""}`} onClick={() => setTab("recipes")}>
          <BookOpen size={19} /> Recipes
        </button>
        <button className={`mp-tab ${tab === "shopping" ? "active" : ""}`} onClick={() => setTab("shopping")}>
          <ShoppingCart size={19} /> Shopping
        </button>
      </nav>

      {pickerSlot && (
        <RecipePickerModal
          recipes={recipes}
          slotKey={pickerSlot.slotKey}
          current={getDayPlan(pickerSlot.dateStr)[pickerSlot.slotKey]}
          onClose={() => setPickerSlot(null)}
          onSelect={(rid) => { setMeal(pickerSlot.dateStr, pickerSlot.slotKey, rid); setPickerSlot(null); }}
          onClear={() => { setMeal(pickerSlot.dateStr, pickerSlot.slotKey, null); setPickerSlot(null); }}
        />
      )}

      {showNoteModal && (
        <div className="mp-modal-backdrop" onClick={() => setShowNoteModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-handle" />
            <div className="mp-h2" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <NotebookPen size={17} /> Prep notes
            </div>
            <p className="mp-sub">{fmtShort(new Date(showNoteModal))}</p>
            <textarea
              className="mp-textarea"
              rows={4}
              placeholder="Chop veggies ahead, marinate chicken, thaw the salmon…"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
            />
            <button
              className="mp-btn mp-btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
              onClick={() => { setDayNote(showNoteModal, noteDraft); setShowNoteModal(false); }}
            >
              Save note
            </button>
          </div>
        </div>
      )}

      {showRecipeForm && (
        <RecipeFormModal
          initial={editingRecipe}
          onClose={() => setShowRecipeForm(false)}
          onSave={(recipe) => {
            if (editingRecipe) {
              saveRecipes(recipes.map((r) => (r.id === recipe.id ? recipe : r)));
              flashToast("Recipe updated");
            } else {
              saveRecipes([...recipes, recipe]);
              flashToast("Recipe added");
            }
            setShowRecipeForm(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          onClose={() => setViewingRecipe(null)}
          onEdit={() => { setEditingRecipe(viewingRecipe); setShowRecipeForm(true); setViewingRecipe(null); }}
          onDelete={() => deleteRecipe(viewingRecipe.id)}
        />
      )}

      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onAdd={(name, qty, section) => { addManualItem(name, qty, section); setShowAddItem(false); }}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "#fff", padding: "9px 16px", borderRadius: 20,
          fontSize: 12.5, zIndex: 200, maxWidth: 300, textAlign: "center"
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function PlanTab({ weekStart, setWeekStart, days, dayDates, selectedDayIdx, setSelectedDayIdx, getDayPlan, recipeById, filledSlots, totalSlots, onOpenPicker, onOpenNote }) {
  const dateStr = dayDates[selectedDayIdx];
  const dp = getDayPlan(dateStr);
  const selectedDate = days[selectedDayIdx];

  return (
    <div className="mp-section">
      <div className="mp-week-nav">
        <button className="mp-arrow-btn" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week"><ChevronLeft size={16} /></button>
        <span className="mp-week-label">{fmtRange(weekStart)}</span>
        <button className="mp-arrow-btn" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week"><ChevronRight size={16} /></button>
      </div>

      <div className="mp-widget-row">
        <div className="mp-index-card mp-widget-stat">
          <div className="mp-widget-num">{filledSlots}/{totalSlots}</div>
          <div className="mp-widget-label">Meals planned</div>
        </div>
        <div className="mp-index-card mp-widget-stat">
          <div className="mp-widget-num">{7 - dayDates.filter((d) => Object.values(getDayPlan(d)).slice(0, 4).every((v) => !v)).length}</div>
          <div className="mp-widget-label">Days started</div>
        </div>
      </div>

      <div className="mp-scrollx">
        {days.map((d, i) => {
          const ds = dayDates[i];
          const p = getDayPlan(ds);
          const filled = MEAL_SLOTS.filter((s) => p[s.key]).length;
          const isToday = fmtISO(new Date()) === ds;
          return (
            <button
              key={ds}
              className={`mp-daypill ${i === selectedDayIdx ? "selected" : ""}`}
              onClick={() => setSelectedDayIdx(i)}
              style={isToday ? { borderColor: "var(--mustard-deep)" } : undefined}
            >
              <span className="dname">{DAY_NAMES[i]}</span>
              <span className="dnum">{d.getDate()}</span>
              <span className="mp-dot-row">
                {MEAL_SLOTS.map((s) => (
                  <span key={s.key} className={`mp-dot ${p[s.key] ? "filled" : ""}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mp-index-card" style={{ padding: "14px 14px 6px 30px", marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16 }}>
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>
        {MEAL_SLOTS.map((slot) => {
          const rid = dp[slot.key];
          const recipe = rid ? recipeById(rid) : null;
          const Icon = slot.icon;
          return (
            <div key={slot.key} className="mp-meal-row" onClick={() => onOpenPicker(dateStr, slot.key)} style={{ cursor: "pointer" }}>
              <div className="mp-meal-icon"><Icon size={15} /></div>
              <div style={{ flex: 1 }}>
                <div className="mp-meal-slot-name">{slot.label}</div>
                {recipe ? (
                  <div className="mp-meal-slot-value">{recipe.name}</div>
                ) : (
                  <div className="mp-meal-slot-empty">Tap to add a recipe</div>
                )}
              </div>
              {recipe && <div style={{ color: "var(--ink-faint)" }}><ChevronRight size={16} /></div>}
            </div>
          );
        })}
      </div>

      <div className="mp-index-card" style={{ padding: "12px 14px 12px 30px", marginTop: 10 }} onClick={() => onOpenNote(dateStr)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <NotebookPen size={15} style={{ color: "var(--ink-soft)" }} />
          <div style={{ flex: 1 }}>
            <div className="mp-meal-slot-name">Meal prep notes</div>
            <div className={dp.note ? "mp-meal-slot-value" : "mp-meal-slot-empty"} style={{ fontSize: 13 }}>
              {dp.note || "Nothing noted for this day"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipesTab({ recipes, recipeFilter, setRecipeFilter, recipeSearch, setRecipeSearch, onView, onAdd }) {
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
          value={recipeSearch}
          onChange={(e) => setRecipeSearch(e.target.value)}
        />
      </div>

      <div className="mp-scrollx" style={{ marginBottom: 12 }}>
        {["Any", ...CATEGORIES.filter((c) => c !== "Any")].map((c) => (
          <button key={c} className={`mp-chip ${recipeFilter === c ? "active" : ""}`} onClick={() => setRecipeFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {recipes.length === 0 ? (
        <div className="mp-empty">
          <ChefHat size={26} style={{ color: "var(--ink-faint)" }} />
          <p>No recipes match yet. Add your first one with the + button.</p>
        </div>
      ) : (
        recipes.map((r) => (
          <div key={r.id} className="mp-index-card mp-recipe-card" onClick={() => onView(r)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p className="mp-recipe-name">{r.name}</p>
                <p className="mp-recipe-meta">{r.category} · {r.ingredients.length} ingredients · {r.type === "multi" ? "multi-step" : "single-step"}</p>
              </div>
              <ChevronRight size={16} style={{ color: "var(--ink-faint)", flexShrink: 0, marginTop: 3 }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ShoppingTab({ itemsBySection, checked, onToggle, onRemoveManual, onReset, checkedCount, totalCount, onAddItem, weekLabel }) {
  const nonEmptySections = SECTIONS.filter((s) => itemsBySection[s].length > 0);
  return (
    <div className="mp-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="mp-h2">Shopping list</div>
          <p className="mp-sub">For {weekLabel} · {checkedCount}/{totalCount} in cart</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="mp-btn" style={{ flex: 1, justifyContent: "center" }} onClick={onAddItem}>
          <Plus size={15} /> Add item
        </button>
        <button className="mp-btn mp-btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={onReset}>
          <RotateCcw size={14} /> Reset list
        </button>
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
                  <div
                    className={`mp-checkbox ${checked[item.id] ? "checked" : ""}`}
                    onClick={() => onToggle(item.id)}
                  >
                    {checked[item.id] && <Check size={13} color="#fff" />}
                  </div>
                  <div
                    style={{ flex: 1, cursor: "pointer" }}
                    onClick={() => onToggle(item.id)}
                  >
                    <span style={{
                      fontSize: 14,
                      textDecoration: checked[item.id] ? "line-through" : "none",
                      color: checked[item.id] ? "var(--ink-faint)" : "var(--ink)"
                    }}>
                      {item.name}
                    </span>
                  </div>
                  {item.qtyLabel && <span className="mp-qty">{item.qtyLabel}</span>}
                  {item.source === "manual" && (
                    <button className="mp-btn-ghost" style={{ color: "var(--ink-faint)" }} onClick={() => onRemoveManual(item.id)} aria-label="Remove item">
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

function RecipePickerModal({ recipes, slotKey, current, onClose, onSelect, onClear }) {
  const [q, setQ] = useState("");
  const slot = MEAL_SLOTS.find((s) => s.key === slotKey);
  const filtered = recipes.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2">Choose {slot.label.toLowerCase()}</div>
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

function RecipeDetailModal({ recipe, onClose, onEdit, onDelete }) {
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mp-h2" style={{ marginBottom: 2 }}>{recipe.name}</div>
            <p className="mp-recipe-meta">{recipe.category} · {recipe.type === "multi" ? "multi-step" : "single-step"}</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button className="mp-btn-ghost" onClick={onEdit} aria-label="Edit recipe"><Pencil size={17} /></button>
            <button className="mp-btn-ghost" onClick={onDelete} aria-label="Delete recipe" style={{ color: "var(--brick)" }}><Trash2 size={17} /></button>
          </div>
        </div>

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

function RecipeFormModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "Dinner");
  const [type, setType] = useState(initial?.type || "single");
  const [prepNotes, setPrepNotes] = useState(initial?.prepNotes || "");
  const [ingredients, setIngredients] = useState(
    initial?.ingredients?.length ? initial.ingredients : [{ id: uid(), name: "", qty: "", unit: "", section: "Produce" }]
  );
  const [steps, setSteps] = useState(
    initial?.type === "multi" && initial?.steps?.length ? initial.steps : (type === "multi" ? [""] : [])
  );
  const [singleInstructions, setSingleInstructions] = useState(
    initial?.type !== "multi" ? (initial?.steps?.[0] || "") : ""
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
  function addStep() { setSteps([...steps, ""]); }
  function removeStep(i) { setSteps(steps.filter((_, idx) => idx !== i)); }

  function handleSave() {
    if (!name.trim()) return;
    const cleanIngredients = ingredients.filter((i) => i.name.trim());
    const recipe = {
      id: initial?.id || uid(),
      name: name.trim(),
      category,
      type,
      prepNotes: prepNotes.trim(),
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

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Category</label>
            <select className="mp-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
              {SECTIONS.map((s) => <option key={s} value={s}>Grocery section: {s}</option>)}
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

function AddItemModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [section, setSection] = useState("Produce");
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2">Add item</div>
        <label className="mp-label">Item name</label>
        <input className="mp-input" style={{ marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="paper towels" />
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Amount (optional)</label>
            <input className="mp-input" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1 roll" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Section</label>
            <select className="mp-select" value={section} onChange={(e) => setSection(e.target.value)}>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button className="mp-btn mp-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onAdd(name, qty, section)} disabled={!name.trim()}>
          <Check size={15} /> Add to list
        </button>
      </div>
    </div>
  );
}
