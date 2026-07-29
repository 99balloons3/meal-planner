import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";
import { cacheGet, cacheSet, enqueueMutation, flushQueue, isOnline, pendingIdsFor } from "../lib/sync";
import { emptyWeekDoc, ensureDay, fromRow, toRow } from "../lib/weekDoc";
import { uid } from "../lib/date";

function weekCacheKey(userId, weekStart) {
  return `mealbox:week:${userId}:${weekStart}`;
}

export async function loadWeekDoc(userId, weekStartIso, days) {
  const key = weekCacheKey(userId, weekStartIso);
  const local = await cacheGet(key, null);
  if (local) return local;

  if (supabaseConfigured && isOnline()) {
    const { data, error } = await supabase
      .from("weeks")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStartIso)
      .maybeSingle();
    if (!error && data) {
      const doc = fromRow(data);
      await cacheSet(key, doc);
      return doc;
    }
  }
  const fresh = { ...emptyWeekDoc(weekStartIso, days), id: uid() };
  await cacheSet(key, fresh);
  return fresh;
}

export function useWeek(userId, weekStartIso, days) {
  const [doc, setDoc] = useState(null);
  const [ready, setReady] = useState(false);
  const key = userId ? weekCacheKey(userId, weekStartIso) : null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setReady(false);
    (async () => {
      const loaded = await loadWeekDoc(userId, weekStartIso, days);
      if (!cancelled) {
        setDoc(loaded);
        setReady(true);
      }
      if (supabaseConfigured && isOnline()) {
        const { data, error } = await supabase
          .from("weeks")
          .select("*")
          .eq("user_id", userId)
          .eq("week_start", weekStartIso)
          .maybeSingle();
        if (!error && data && !cancelled) {
          const pending = await pendingIdsFor("weeks");
          if (!pending.has(data.id)) {
            const serverDoc = fromRow(data);
            const localNow = await cacheGet(key, null);
            if (!localNow || new Date(serverDoc.updatedAt) >= new Date(localNow.updatedAt)) {
              setDoc(serverDoc);
              await cacheSet(key, serverDoc);
            }
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, weekStartIso, key]);

  const persist = useCallback(
    async (next) => {
      setDoc(next);
      await cacheSet(key, next);
      if (supabaseConfigured) {
        await enqueueMutation({
          table: "weeks",
          op: "upsert",
          row: toRow(next, userId),
          onConflict: "user_id,week_start",
        });
        flushQueue();
      }
    },
    [key, userId]
  );

  const updateDoc = useCallback(
    (mutator) => {
      setDoc((prev) => {
        if (!prev) return prev;
        const draft = mutator(structuredClone(prev));
        draft.updatedAt = new Date().toISOString();
        persist(draft);
        return draft;
      });
    },
    [persist]
  );

  const setMeal = useCallback(
    (dateStr, slotId, recipeId) => {
      updateDoc((draft) => {
        const day = (draft.days[dateStr] = ensureDay(draft, dateStr));
        const slot = day.slots.find((s) => s.id === slotId);
        if (slot) slot.recipeId = recipeId;
        return draft;
      });
    },
    [updateDoc]
  );

  const addSnackSlot = useCallback(
    (dateStr) => {
      updateDoc((draft) => {
        const day = (draft.days[dateStr] = ensureDay(draft, dateStr));
        day.slots.push({ id: uid(), type: "snack", recipeId: null });
        return draft;
      });
    },
    [updateDoc]
  );

  const removeSlot = useCallback(
    (dateStr, slotId) => {
      updateDoc((draft) => {
        const day = (draft.days[dateStr] = ensureDay(draft, dateStr));
        day.slots = day.slots.filter((s) => s.id !== slotId);
        return draft;
      });
    },
    [updateDoc]
  );

  const reorderSlots = useCallback(
    (dateStr, orderedIds) => {
      updateDoc((draft) => {
        const day = (draft.days[dateStr] = ensureDay(draft, dateStr));
        const byId = new Map(day.slots.map((s) => [s.id, s]));
        day.slots = orderedIds.map((id) => byId.get(id)).filter(Boolean);
        return draft;
      });
    },
    [updateDoc]
  );

  const setDayNote = useCallback(
    (dateStr, note) => {
      updateDoc((draft) => {
        const day = (draft.days[dateStr] = ensureDay(draft, dateStr));
        day.note = note;
        return draft;
      });
    },
    [updateDoc]
  );

  const reorderDays = useCallback(
    (orderedDayDates) => {
      updateDoc((draft) => {
        draft.dayOrder = orderedDayDates;
        return draft;
      });
    },
    [updateDoc]
  );

  const toggleChecked = useCallback(
    (itemId) => {
      updateDoc((draft) => {
        draft.shopping.checked[itemId] = !draft.shopping.checked[itemId];
        return draft;
      });
    },
    [updateDoc]
  );

  const addManualItem = useCallback(
    (name, qtyLabel, section) => {
      updateDoc((draft) => {
        draft.shopping.manual.push({ id: uid(), name, qtyLabel, section });
        return draft;
      });
    },
    [updateDoc]
  );

  const removeManualItem = useCallback(
    (id) => {
      updateDoc((draft) => {
        draft.shopping.manual = draft.shopping.manual.filter((i) => i.id !== id);
        return draft;
      });
    },
    [updateDoc]
  );

  const resetShopping = useCallback(() => {
    updateDoc((draft) => {
      draft.shopping = { manual: [], checked: {} };
      return draft;
    });
  }, [updateDoc]);

  const replaceDays = useCallback(
    (daysMap, dayOrder) => {
      updateDoc((draft) => {
        draft.days = daysMap;
        draft.dayOrder = dayOrder;
        return draft;
      });
    },
    [updateDoc]
  );

  return {
    doc,
    ready,
    setMeal,
    addSnackSlot,
    removeSlot,
    reorderSlots,
    setDayNote,
    reorderDays,
    toggleChecked,
    addManualItem,
    removeManualItem,
    resetShopping,
    replaceDays,
  };
}
