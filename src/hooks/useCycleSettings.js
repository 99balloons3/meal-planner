import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";
import { cacheGet, cacheSet, enqueueMutation, flushQueue, isOnline, pendingIdsFor } from "../lib/sync";
import { uid } from "../lib/date";

function cacheKey(userId) {
  return `mealbox:cycle:${userId}`;
}

function defaultSettings() {
  return {
    id: uid(),
    enabled: false,
    startDate: null,
    avgCycleLength: 28,
    updatedAt: new Date().toISOString(),
  };
}

function fromRow(row) {
  return {
    id: row.id,
    enabled: !!row.enabled,
    startDate: row.start_date,
    avgCycleLength: row.avg_cycle_length,
    updatedAt: row.updated_at,
  };
}

function toRow(settings, userId) {
  return {
    id: settings.id,
    user_id: userId,
    enabled: settings.enabled,
    start_date: settings.startDate,
    avg_cycle_length: settings.avgCycleLength,
    updated_at: settings.updatedAt,
  };
}

export function useCycleSettings(userId) {
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);
  const key = userId ? cacheKey(userId) : null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      const local = await cacheGet(key, null);
      const initial = local || defaultSettings();
      if (!cancelled) {
        setSettings(initial);
        setReady(true);
      }
      if (!local) await cacheSet(key, initial);

      if (supabaseConfigured && isOnline()) {
        const { data, error } = await supabase
          .from("cycle_settings")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (!error && data && !cancelled) {
          const pending = await pendingIdsFor("cycle_settings");
          if (!pending.has(data.id)) {
            const serverDoc = fromRow(data);
            const localNow = await cacheGet(key, null);
            if (!localNow || new Date(serverDoc.updatedAt) >= new Date(localNow.updatedAt)) {
              setSettings(serverDoc);
              await cacheSet(key, serverDoc);
            }
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, key]);

  const persist = useCallback(
    async (next) => {
      setSettings(next);
      await cacheSet(key, next);
      if (supabaseConfigured) {
        await enqueueMutation({ table: "cycle_settings", op: "upsert", row: toRow(next, userId), onConflict: "user_id" });
        flushQueue();
      }
    },
    [key, userId]
  );

  const update = useCallback(
    (patch) => {
      setSettings((prev) => {
        const base = prev || defaultSettings();
        const next = { ...base, ...patch, updatedAt: new Date().toISOString() };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setEnabled = useCallback((enabled) => update({ enabled }), [update]);
  const setStartDate = useCallback((startDate) => update({ startDate }), [update]);
  const setAvgCycleLength = useCallback((avgCycleLength) => update({ avgCycleLength }), [update]);

  return { settings, ready, setEnabled, setStartDate, setAvgCycleLength };
}
