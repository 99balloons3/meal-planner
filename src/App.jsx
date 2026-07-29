import { useCallback, useMemo, useState } from "react";
import { Calendar, BookOpen, ShoppingCart, Plus, LogOut, WifiOff, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useRecipes } from "./hooks/useRecipes";
import { useWeek, loadWeekDoc } from "./hooks/useWeek";
import { useSyncStatus } from "./hooks/useSyncStatus";
import { useCycleSettings } from "./hooks/useCycleSettings";
import { addDays, fmtISO, getMonday } from "./lib/date";
import { SECTIONS } from "./lib/constants";
import { duplicateWeek } from "./lib/weekDoc";
import { phaseForDate } from "./lib/cycle";

import AuthGate from "./components/AuthGate";
import PlanTab from "./components/PlanTab";
import RecipesTab from "./components/RecipesTab";
import ShoppingTab from "./components/ShoppingTab";
import RecipePickerModal from "./components/modals/RecipePickerModal";
import NoteModal from "./components/modals/NoteModal";
import RecipeFormModal from "./components/modals/RecipeFormModal";
import RecipeDetailModal from "./components/modals/RecipeDetailModal";
import AddItemModal from "./components/modals/AddItemModal";
import CycleSettingsModal from "./components/modals/CycleSettingsModal";

export default function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="mp-loading-wrap">
        <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>Loading your kitchen…</p>
      </div>
    );
  }

  if (!auth.user) {
    return <AuthGate auth={auth} />;
  }

  return <MealBoxApp user={auth.user} signOut={auth.signOut} />;
}

function MealBoxApp({ user, signOut }) {
  const [tab, setTab] = useState("plan");
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [pickerSlot, setPickerSlot] = useState(null);
  const [noteDay, setNoteDay] = useState(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCycleSettings, setShowCycleSettings] = useState(false);
  const [toast, setToast] = useState("");

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekKey = fmtISO(weekStart);

  const { recipes, ready: recipesReady, saveRecipe, deleteRecipe, toggleFavorite } = useRecipes(user.id);
  const week = useWeek(user.id, weekKey, days);
  const sync = useSyncStatus();
  const cycle = useCycleSettings(user.id);
  const cycleEnabled = !!cycle.settings?.enabled;

  const recipeById = useCallback((id) => recipes.find((r) => r.id === id), [recipes]);
  const getPhaseForDate = useCallback((dateStr) => phaseForDate(dateStr, cycle.settings), [cycle.settings]);

  function flashToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  const autoItems = useMemo(() => {
    if (!week.doc) return [];
    const map = {};
    week.doc.dayOrder.forEach((dateStr) => {
      const day = week.doc.days[dateStr];
      if (!day) return;
      const phase = cycleEnabled ? getPhaseForDate(dateStr) : null;
      day.slots.forEach((slot) => {
        if (!slot.recipeId) return;
        const recipe = recipeById(slot.recipeId);
        if (!recipe) return;
        const isPhaseMatch = phase && (recipe.phaseTags || []).includes(phase.key);
        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name.trim().toLowerCase()}|${ing.unit || ""}`;
          if (!map[key]) {
            map[key] = {
              id: key,
              name: ing.name,
              unit: ing.unit,
              section: ing.section || "Other",
              qty: 0,
              qtyParts: [],
              phaseRelevant: false,
            };
          }
          if (isPhaseMatch) map[key].phaseRelevant = true;
          const n = parseFloat(ing.qty);
          if (!isNaN(n)) map[key].qty += n;
          else if (ing.qty) map[key].qtyParts.push(ing.qty);
        });
      });
    });
    return Object.values(map).map((it) => {
      let qtyLabel = "";
      if (it.qty > 0) qtyLabel = `${parseFloat(it.qty.toFixed(2))}${it.unit ? " " + it.unit : ""}`;
      if (it.qtyParts.length) qtyLabel = [qtyLabel, ...it.qtyParts].filter(Boolean).join(" + ");
      return { ...it, qtyLabel, source: "auto" };
    });
  }, [week.doc, recipeById, cycleEnabled, getPhaseForDate]);

  const allItems = useMemo(() => {
    const manual = (week.doc?.shopping.manual || []).map((it) => ({ ...it, source: "manual" }));
    return [...autoItems, ...manual];
  }, [autoItems, week.doc]);

  const itemsBySection = useMemo(() => {
    const bySection = {};
    SECTIONS.forEach((s) => (bySection[s] = []));
    allItems.forEach((it) => {
      const sec = SECTIONS.includes(it.section) ? it.section : "Other";
      bySection[sec].push(it);
    });
    Object.keys(bySection).forEach((s) => {
      bySection[s].sort((a, b) => (b.phaseRelevant ? 1 : 0) - (a.phaseRelevant ? 1 : 0));
    });
    return bySection;
  }, [allItems]);

  const checked = week.doc?.shopping.checked || {};
  const checkedCount = allItems.filter((i) => checked[i.id]).length;

  async function handleDuplicateLastWeek() {
    if (!week.doc) return;
    const currentHasMeals = week.doc.dayOrder.some((d) => (week.doc.days[d]?.slots || []).some((s) => s.recipeId));
    if (currentHasMeals && !window.confirm("This replaces your currently planned meals for this week. Continue?")) {
      return;
    }
    const prevWeekStart = addDays(weekStart, -7);
    const prevDays = Array.from({ length: 7 }, (_, i) => addDays(prevWeekStart, i));
    const prevDoc = await loadWeekDoc(user.id, fmtISO(prevWeekStart), prevDays);
    const hasPrevMeals = prevDoc.dayOrder.some((d) => (prevDoc.days[d]?.slots || []).some((s) => s.recipeId));
    if (!hasPrevMeals) {
      flashToast("Last week is empty — nothing to duplicate");
      return;
    }
    const { days: newDays, dayOrder } = duplicateWeek(prevDoc, prevWeekStart, weekStart);
    week.replaceDays(newDays, dayOrder);
    flashToast("Copied last week's plan");
  }

  async function handleShareShoppingList() {
    const lines = [`The Meal Box — Shopping List`, `For ${weekLabel(weekStart)}`, ""];
    SECTIONS.forEach((s) => {
      if (!itemsBySection[s].length) return;
      lines.push(s.toUpperCase());
      itemsBySection[s].forEach((it) => {
        lines.push(`- ${it.name}${it.qtyLabel ? ` (${it.qtyLabel})` : ""}`);
      });
      lines.push("");
    });
    const text = lines.join("\n").trim();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shopping List", text });
        return;
      } catch {
        // user cancelled or share failed; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      flashToast("Shopping list copied to clipboard");
    } catch {
      flashToast("Couldn't share — try Print instead");
    }
  }

  const pickerPhase = pickerSlot && cycleEnabled ? getPhaseForDate(pickerSlot.dateStr) : null;

  return (
    <div className="mp-root">
      <div className="mp-header">
        <div>
          <div className="mp-brand">
            <span className="mp-brand-mark" />
            The Meal Box
          </div>
          <div className="mp-tagline">weekly plans · shopping · recipes</div>
        </div>
        <div className="mp-header-actions">
          <button
            className={`mp-chip herb ${cycleEnabled ? "active" : ""}`}
            onClick={() => setShowCycleSettings(true)}
            title="Cycle-sync settings"
          >
            <Sparkles size={12} /> Cycle sync
          </button>
          <button className="mp-icon-btn" onClick={signOut} aria-label="Sign out">
            <LogOut size={15} />
          </button>
          <div className="mp-avatar" title={user.email}>
            {user.email?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
      </div>

      {!sync.online && (
        <div className="mp-status-banner offline">
          <WifiOff size={13} /> Offline — changes will sync when you're back online
        </div>
      )}
      {sync.online && sync.pending > 0 && (
        <div className="mp-status-banner syncing">
          <RefreshCw size={13} /> Syncing…
        </div>
      )}

      {tab === "plan" && (
        <PlanTab
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          doc={week.doc}
          ready={week.ready}
          recipeById={recipeById}
          onOpenPicker={(dateStr, slotId, label) => setPickerSlot({ dateStr, slotId, label })}
          onOpenNote={(dateStr) => setNoteDay(dateStr)}
          reorderDays={week.reorderDays}
          reorderSlots={week.reorderSlots}
          addSnackSlot={week.addSnackSlot}
          removeSlot={week.removeSlot}
          canDuplicate
          onDuplicateLastWeek={handleDuplicateLastWeek}
          getPhaseForDate={cycleEnabled ? getPhaseForDate : null}
          cycleSettings={cycleEnabled ? cycle.settings : null}
        />
      )}

      {tab === "recipes" && (
        <RecipesTab recipes={recipesReady ? recipes : []} onView={setViewingRecipe} onToggleFavorite={toggleFavorite} />
      )}

      {tab === "shopping" && week.doc && (
        <ShoppingTab
          itemsBySection={itemsBySection}
          checked={checked}
          onToggle={week.toggleChecked}
          onRemoveManual={week.removeManualItem}
          onReset={() => {
            week.resetShopping();
            flashToast("Shopping list reset");
          }}
          checkedCount={checkedCount}
          totalCount={allItems.length}
          onAddItem={() => setShowAddItem(true)}
          weekLabel={weekLabel(weekStart)}
          onShare={handleShareShoppingList}
          cycleEnabled={cycleEnabled}
        />
      )}

      {tab === "recipes" && (
        <button
          className="mp-fab"
          onClick={() => {
            setEditingRecipe(null);
            setShowRecipeForm(true);
          }}
          aria-label="Add recipe"
        >
          <Plus size={24} />
        </button>
      )}

      <nav className="mp-tabbar mp-no-print">
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

      {pickerSlot && week.doc && (
        <RecipePickerModal
          recipes={recipes}
          slotLabel={pickerSlot.label}
          current={week.doc.days[pickerSlot.dateStr]?.slots.find((s) => s.id === pickerSlot.slotId)?.recipeId}
          phase={pickerPhase}
          onClose={() => setPickerSlot(null)}
          onSelect={(rid) => {
            week.setMeal(pickerSlot.dateStr, pickerSlot.slotId, rid);
            setPickerSlot(null);
          }}
          onClear={() => {
            week.setMeal(pickerSlot.dateStr, pickerSlot.slotId, null);
            setPickerSlot(null);
          }}
        />
      )}

      {noteDay && week.doc && (
        <NoteModal
          dateStr={noteDay}
          initialNote={week.doc.days[noteDay]?.note || ""}
          onClose={() => setNoteDay(null)}
          onSave={(note) => {
            week.setDayNote(noteDay, note);
            setNoteDay(null);
          }}
        />
      )}

      {showRecipeForm && (
        <RecipeFormModal
          initial={editingRecipe}
          cycleEnabled={cycleEnabled}
          onClose={() => setShowRecipeForm(false)}
          onSave={async (recipe) => {
            await saveRecipe(recipe);
            flashToast(editingRecipe ? "Recipe updated" : "Recipe added");
            setShowRecipeForm(false);
            setEditingRecipe(null);
          }}
        />
      )}

      {viewingRecipe && (
        <RecipeDetailModal
          recipe={recipes.find((r) => r.id === viewingRecipe.id) || viewingRecipe}
          onClose={() => setViewingRecipe(null)}
          onToggleFavorite={toggleFavorite}
          onEdit={() => {
            setEditingRecipe(viewingRecipe);
            setShowRecipeForm(true);
            setViewingRecipe(null);
          }}
          onDelete={async () => {
            await deleteRecipe(viewingRecipe.id);
            setViewingRecipe(null);
            flashToast("Recipe deleted");
          }}
        />
      )}

      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onAdd={(name, qty, section) => {
            week.addManualItem(name.trim(), qty, section);
            setShowAddItem(false);
          }}
        />
      )}

      {showCycleSettings && <CycleSettingsModal cycle={cycle} onClose={() => setShowCycleSettings(false)} />}

      {toast && <div className="mp-toast">{toast}</div>}
    </div>
  );
}

function weekLabel(weekStart) {
  const sunday = addDays(weekStart, 6);
  const opts = { month: "short", day: "numeric" };
  return `${weekStart.toLocaleDateString("en-US", opts)} – ${sunday.toLocaleDateString("en-US", opts)}`;
}
