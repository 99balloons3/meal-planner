import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
  NotebookPen,
  GripVertical,
  X,
  Plus,
  Copy,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addDays, fmtISO } from "../lib/date";
import { DAY_NAMES } from "../lib/constants";
import { slotLabel } from "../lib/weekDoc";
import { macroTargetsFor } from "../lib/cycle";

const SLOT_ICONS = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Cookie };

function DayPill({ dateStr, index, selected, filled, total, isToday, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dateStr,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const date = new Date(dateStr + "T00:00:00");
  return (
    <button
      ref={setNodeRef}
      style={isToday ? { ...style, borderColor: "var(--mustard-deep)" } : style}
      className={`mp-daypill ${selected ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <span className="dname">{DAY_NAMES[index]}</span>
      <span className="dnum">{date.getDate()}</span>
      <span className="mp-dot-row">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`mp-dot ${i < filled ? "filled" : ""}`} />
        ))}
      </span>
    </button>
  );
}

function MealSlotRow({ slot, label, recipe, onOpenPicker, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slot.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const Icon = SLOT_ICONS[slot.type] || Cookie;
  return (
    <div ref={setNodeRef} style={style} className={`mp-meal-row ${isDragging ? "dragging" : ""}`}>
      <span className="mp-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={15} />
      </span>
      <div className="mp-meal-icon">
        <Icon size={15} />
      </div>
      <div style={{ flex: 1, cursor: "pointer" }} onClick={onOpenPicker}>
        <div className="mp-meal-slot-name">{label}</div>
        {recipe ? (
          <div className="mp-meal-slot-value">{recipe.name}</div>
        ) : (
          <div className="mp-meal-slot-empty">Tap to add a recipe</div>
        )}
      </div>
      {recipe && <div style={{ color: "var(--ink-faint)" }}><ChevronRight size={16} /></div>}
      {slot.type === "snack" && (
        <button className="mp-meal-remove" onClick={onRemove} aria-label="Remove snack slot">
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function DayCard({
  dateStr,
  isSelected,
  isToday,
  day,
  recipeById,
  onOpenPicker,
  onOpenNote,
  addSnackSlot,
  removeSlot,
  reorderSlots,
  phase,
  macros,
}) {
  const date = new Date(dateStr + "T00:00:00");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function handleSlotDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = day.slots.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    reorderSlots(dateStr, arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div
      className="mp-index-card mp-day-card"
      data-selected={isSelected ? "true" : "false"}
      style={isToday ? { borderColor: "var(--mustard-deep)" } : undefined}
    >
      <div className="mp-day-card-header">
        <span className="mp-day-card-title">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </span>
        {phase && (
          <span className="mp-phase-pill" title={phase.description || undefined}>
            {phase.emoji} {phase.label}
          </span>
        )}
      </div>

      {macros && (
        <div className="mp-macro-strip" title="Suggested daily target for this phase — edit in cycle-sync settings">
          <span>{macros.calories} kcal</span>
          <span>{macros.carbs}g carb</span>
          <span>{macros.protein}g protein</span>
          <span>{macros.fat}g fat</span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSlotDragEnd}>
        <SortableContext items={day.slots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {day.slots.map((slot) => (
            <MealSlotRow
              key={slot.id}
              slot={slot}
              label={slotLabel(slot, day.slots)}
              recipe={slot.recipeId ? recipeById(slot.recipeId) : null}
              onOpenPicker={() => onOpenPicker(dateStr, slot.id, slotLabel(slot, day.slots))}
              onRemove={() => removeSlot(dateStr, slot.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button className="mp-btn mp-add-snack" onClick={() => addSnackSlot(dateStr)}>
        <Plus size={14} /> Add snack
      </button>

      <div className="mp-day-note-row" onClick={() => onOpenNote(dateStr)}>
        <NotebookPen size={15} style={{ color: "var(--ink-soft)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mp-meal-slot-name">Meal prep notes</div>
          <div className={day.note ? "mp-meal-slot-value mp-day-note-text" : "mp-meal-slot-empty mp-day-note-text"}>
            {day.note || "Nothing noted for this day"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanTab({
  weekStart,
  setWeekStart,
  doc,
  ready,
  recipeById,
  onOpenPicker,
  onOpenNote,
  reorderDays,
  reorderSlots,
  addSnackSlot,
  removeSlot,
  canDuplicate,
  onDuplicateLastWeek,
  getPhaseForDate,
  cycleSettings,
}) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  if (!ready || !doc) {
    return (
      <div className="mp-section">
        <p className="mp-sub">Loading your week…</p>
      </div>
    );
  }

  const dayOrder = doc.dayOrder;
  const todayStr = fmtISO(new Date());

  const totalSlots = dayOrder.reduce((sum, d) => sum + (doc.days[d]?.slots.length || 0), 0);
  const filledSlots = dayOrder.reduce(
    (sum, d) => sum + (doc.days[d]?.slots.filter((s) => s.recipeId).length || 0),
    0
  );
  const daysStarted = dayOrder.filter((d) => (doc.days[d]?.slots || []).some((s) => s.recipeId)).length;

  function handleDayDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dayOrder.indexOf(active.id);
    const newIndex = dayOrder.indexOf(over.id);
    reorderDays(arrayMove(dayOrder, oldIndex, newIndex));
  }

  return (
    <div className="mp-section">
      <div className="mp-week-nav">
        <button className="mp-arrow-btn" onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week">
          <ChevronLeft size={16} />
        </button>
        <span className="mp-week-label">
          {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <button className="mp-arrow-btn" onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week">
          <ChevronRight size={16} />
        </button>
      </div>

      {canDuplicate && (
        <button className="mp-btn" style={{ width: "100%", justifyContent: "center", marginBottom: 12 }} onClick={onDuplicateLastWeek}>
          <Copy size={14} /> Duplicate last week
        </button>
      )}

      <div className="mp-widget-row">
        <div className="mp-index-card mp-widget-stat">
          <div className="mp-widget-num">{filledSlots}/{totalSlots}</div>
          <div className="mp-widget-label">Meals planned</div>
        </div>
        <div className="mp-index-card mp-widget-stat">
          <div className="mp-widget-num">{daysStarted}</div>
          <div className="mp-widget-label">Days started</div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDayDragEnd}>
        <SortableContext items={dayOrder} strategy={horizontalListSortingStrategy}>
          <div className="mp-scrollx" style={{ marginBottom: 4 }}>
            {dayOrder.map((ds, i) => {
              const p = doc.days[ds] || { slots: [] };
              return (
                <DayPill
                  key={ds}
                  dateStr={ds}
                  index={i}
                  selected={i === selectedDayIdx}
                  filled={p.slots.filter((s) => s.recipeId).length}
                  total={Math.max(p.slots.length, 1)}
                  isToday={ds === todayStr}
                  onSelect={() => setSelectedDayIdx(i)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mp-days-wrap">
        {dayOrder.map((ds, i) => {
          const phase = getPhaseForDate ? getPhaseForDate(ds) : null;
          const macros = phase && cycleSettings ? macroTargetsFor(cycleSettings, phase.key) : null;
          return (
          <DayCard
            key={ds}
            dateStr={ds}
            isSelected={i === selectedDayIdx}
            isToday={ds === todayStr}
            day={doc.days[ds] || { slots: [], note: "" }}
            recipeById={recipeById}
            onOpenPicker={onOpenPicker}
            onOpenNote={onOpenNote}
            addSnackSlot={addSnackSlot}
            removeSlot={removeSlot}
            reorderSlots={reorderSlots}
            phase={phase}
            macros={macros}
          />
          );
        })}
      </div>
    </div>
  );
}
