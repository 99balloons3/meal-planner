import { get, set, del } from "idb-keyval";
import { supabase, supabaseConfigured } from "./supabaseClient";

const QUEUE_KEY = "mealbox:queue";

export function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function onNetworkChange(cb) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export async function cacheGet(key, fallback) {
  try {
    const v = await get(key);
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
}

export async function cacheSet(key, value) {
  try {
    await set(key, value);
  } catch {
    // best-effort; storage may be unavailable (e.g. private browsing)
  }
}

export async function cacheDel(key) {
  try {
    await del(key);
  } catch {
    // ignore
  }
}

async function getQueue() {
  return cacheGet(QUEUE_KEY, []);
}

async function setQueue(q) {
  await cacheSet(QUEUE_KEY, q);
}

export async function enqueueMutation(mutation) {
  const q = await getQueue();
  q.push({ ...mutation, queuedAt: Date.now() });
  await setQueue(q);
  return q;
}

export async function pendingIdsFor(table) {
  const q = await getQueue();
  return new Set(q.filter((m) => m.table === table).map((m) => m.row.id));
}

let flushing = false;
const listeners = new Set();

export function onQueueChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(state) {
  listeners.forEach((cb) => cb(state));
}

export async function queueLength() {
  const q = await getQueue();
  return q.length;
}

export async function flushQueue() {
  if (!supabaseConfigured || flushing || !isOnline()) return;
  flushing = true;
  notify("syncing");
  try {
    let q = await getQueue();
    while (q.length) {
      const mutation = q[0];
      try {
        await applyMutation(mutation);
      } catch (err) {
        // Network / server error: stop here, keep remaining queue for later.
        if (isRetryable(err)) break;
        // Non-retryable (e.g. validation, RLS): drop it so it doesn't block the queue forever.
        console.warn("Dropping unsyncable mutation", mutation, err);
      }
      q = q.slice(1);
      await setQueue(q);
    }
  } finally {
    flushing = false;
    notify((await queueLength()) > 0 ? "pending" : "idle");
  }
}

function isRetryable(err) {
  return !err?.code || err.code === "PGRST301" || err.message?.includes("Failed to fetch");
}

async function applyMutation(mutation) {
  const { table, op, row, onConflict } = mutation;
  if (op === "delete") {
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from(table).upsert(row, onConflict ? { onConflict } : undefined);
  if (error) throw error;
}

export function initSyncEngine() {
  flushQueue();
  const off1 = onNetworkChange(() => {
    if (isOnline()) flushQueue();
  });
  const interval = setInterval(() => {
    if (isOnline()) flushQueue();
  }, 20000);
  return () => {
    off1();
    clearInterval(interval);
  };
}
