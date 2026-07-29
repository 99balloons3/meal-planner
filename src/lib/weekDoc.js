import { uid, fmtISO, addDays } from "./date";

export function defaultDaySlots() {
  return [
    { id: uid(), type: "breakfast", recipeId: null },
    { id: uid(), type: "lunch", recipeId: null },
    { id: uid(), type: "dinner", recipeId: null },
    { id: uid(), type: "snack", recipeId: null },
  ];
}

export function emptyWeekDoc(weekStartIso, days) {
  const dayDates = days.map(fmtISO);
  const daysMap = {};
  dayDates.forEach((d) => {
    daysMap[d] = { slots: defaultDaySlots(), note: "" };
  });
  return {
    weekStart: weekStartIso,
    dayOrder: dayDates,
    days: daysMap,
    shopping: { manual: [], checked: {} },
    updatedAt: new Date().toISOString(),
  };
}

export function ensureDay(doc, dateStr) {
  if (doc.days[dateStr]) return doc.days[dateStr];
  return { slots: defaultDaySlots(), note: "" };
}

export function slotLabel(slot, slotsInDay) {
  if (slot.type !== "snack") {
    return slot.type[0].toUpperCase() + slot.type.slice(1);
  }
  const snackIndex = slotsInDay.filter((s) => s.type === "snack").findIndex((s) => s.id === slot.id);
  return `Snack ${snackIndex + 1}`;
}

export function duplicateWeek(prevDoc, prevWeekStart, newWeekStart) {
  const prevDayDates = Array.from({ length: 7 }, (_, i) => fmtISO(addDays(prevWeekStart, i)));
  const offsetOf = new Map(prevDayDates.map((d, i) => [d, i]));
  const newDayOrder = prevDoc.dayOrder.map((d) => {
    const offset = offsetOf.has(d) ? offsetOf.get(d) : prevDayDates.indexOf(d);
    return fmtISO(addDays(newWeekStart, Math.max(offset, 0)));
  });
  const newDays = {};
  prevDoc.dayOrder.forEach((prevDate, idx) => {
    const newDate = newDayOrder[idx];
    const prevDay = prevDoc.days[prevDate] || { slots: [], note: "" };
    newDays[newDate] = {
      slots: prevDay.slots.map((s) => ({ ...s, id: uid() })),
      note: prevDay.note || "",
    };
  });
  return { days: newDays, dayOrder: newDayOrder };
}

export function fromRow(row) {
  return {
    id: row.id,
    weekStart: row.week_start,
    dayOrder: row.day_order,
    days: row.days,
    shopping: row.shopping,
    updatedAt: row.updated_at,
  };
}

export function toRow(doc, userId) {
  return {
    id: doc.id,
    user_id: userId,
    week_start: doc.weekStart,
    day_order: doc.dayOrder,
    days: doc.days,
    shopping: doc.shopping,
    updated_at: doc.updatedAt,
  };
}
