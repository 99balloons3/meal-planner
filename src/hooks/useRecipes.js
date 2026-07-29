import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "../lib/supabaseClient";
import { cacheGet, cacheSet, enqueueMutation, flushQueue, isOnline, pendingIdsFor } from "../lib/sync";
import { mergeCollection } from "../lib/mergeCollection";
import { uid } from "../lib/date";

const STARTER_RECIPES = [
  {
    name: "Overnight Oats",
    category: "Breakfast",
    type: "single",
    prepNotes: "Make in mason jars the night before — grab and go.",
    tags: ["quick", "make-ahead"],
    favorite: true,
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
    name: "Sheet Pan Chicken Fajitas",
    category: "Dinner",
    type: "multi",
    prepNotes: "Slice peppers and onions ahead on Sunday.",
    tags: ["sheet-pan", "family favorite"],
    favorite: false,
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
    name: "Big Salad with Chickpeas",
    category: "Lunch",
    type: "single",
    prepNotes: "",
    tags: ["vegetarian", "quick"],
    favorite: false,
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

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    prepNotes: row.prep_notes,
    ingredients: row.ingredients,
    steps: row.steps,
    tags: row.tags || [],
    favorite: !!row.favorite,
    updatedAt: row.updated_at,
  };
}

function toRow(recipe, userId) {
  return {
    id: recipe.id,
    user_id: userId,
    name: recipe.name,
    category: recipe.category,
    type: recipe.type,
    prep_notes: recipe.prepNotes || "",
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    tags: recipe.tags || [],
    favorite: !!recipe.favorite,
    updated_at: recipe.updatedAt,
  };
}

export function useRecipes(userId) {
  const [recipes, setRecipes] = useState([]);
  const [ready, setReady] = useState(false);
  const cacheKey = userId ? `mealbox:recipes:${userId}` : null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      const local = await cacheGet(cacheKey, null);
      if (local) {
        if (!cancelled) setRecipes(local);
      } else if (!cancelled) {
        const seeded = STARTER_RECIPES.map((r) => ({ ...r, id: uid(), updatedAt: new Date().toISOString() }));
        setRecipes(seeded);
        await cacheSet(cacheKey, seeded);
        if (supabaseConfigured && isOnline()) {
          for (const r of seeded) {
            await enqueueMutation({ table: "recipes", op: "upsert", row: toRow(r, userId) });
          }
          flushQueue();
        }
      }
      if (!cancelled) setReady(true);

      if (supabaseConfigured && isOnline()) {
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });
        if (!error && data && !cancelled) {
          const pending = await pendingIdsFor("recipes");
          const currentLocal = await cacheGet(cacheKey, []);
          const merged = mergeCollection(data.map(fromRow), currentLocal, pending);
          setRecipes(merged);
          await cacheSet(cacheKey, merged);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, cacheKey]);

  const persist = useCallback(
    async (next) => {
      setRecipes(next);
      await cacheSet(cacheKey, next);
    },
    [cacheKey]
  );

  const saveRecipe = useCallback(
    async (recipe) => {
      const withMeta = { ...recipe, id: recipe.id || uid(), updatedAt: new Date().toISOString() };
      const exists = recipes.some((r) => r.id === withMeta.id);
      const next = exists ? recipes.map((r) => (r.id === withMeta.id ? withMeta : r)) : [...recipes, withMeta];
      await persist(next);
      if (supabaseConfigured) {
        await enqueueMutation({ table: "recipes", op: "upsert", row: toRow(withMeta, userId) });
        flushQueue();
      }
      return withMeta;
    },
    [recipes, persist, userId]
  );

  const deleteRecipe = useCallback(
    async (id) => {
      const next = recipes.filter((r) => r.id !== id);
      await persist(next);
      if (supabaseConfigured) {
        await enqueueMutation({ table: "recipes", op: "delete", row: { id } });
        flushQueue();
      }
    },
    [recipes, persist]
  );

  const toggleFavorite = useCallback(
    async (id) => {
      const target = recipes.find((r) => r.id === id);
      if (!target) return;
      await saveRecipe({ ...target, favorite: !target.favorite });
    },
    [recipes, saveRecipe]
  );

  return { recipes, ready, saveRecipe, deleteRecipe, toggleFavorite };
}
