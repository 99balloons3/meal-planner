// Food guidance (not numeric macro/calorie targets, by request) — general
// nutrients that tend to help each phase, with a handful of example foods
// leaning toward a vegan pantry. Meant as a friendly starting point, not a
// medical or nutritional prescription.
export const PHASES = {
  menstrual: {
    key: "menstrual",
    label: "Menstrual",
    emoji: "🩸",
    description: "Iron and magnesium support",
    foods: ["chickpeas", "tofu", "dark leafy greens", "dark chocolate"],
  },
  follicular: {
    key: "follicular",
    label: "Follicular",
    emoji: "🌱",
    description: "Lighter, fresh, energizing foods",
    foods: ["citrus", "apples", "sprouted grains", "tempeh"],
  },
  ovulatory: {
    key: "ovulatory",
    label: "Ovulatory",
    emoji: "☀️",
    description: "Fiber and antioxidant-rich foods",
    foods: ["colorful veggies like carrots & peppers", "berries", "flax", "chickpeas"],
  },
  luteal: {
    key: "luteal",
    label: "Luteal",
    emoji: "🌙",
    description: "Grounding, complex carbs and healthy fats",
    foods: ["sweet potatoes", "oats", "peanut butter", "vegan chicken or tempeh"],
  },
};

export const PHASE_ORDER = ["menstrual", "follicular", "ovulatory", "luteal"];

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

// Cycle day is 1-indexed and wraps using the average length, so it works
// for any date past or future relative to the logged start date.
export function cycleDayForDate(dateStr, startDateStr, avgLength) {
  const length = Math.max(15, Math.min(45, avgLength || 28));
  const start = new Date(startDateStr + "T00:00:00");
  const date = new Date(dateStr + "T00:00:00");
  const diff = daysBetween(start, date);
  const cycleDay = (((diff % length) + length) % length) + 1;
  return { cycleDay, length };
}

// Approximate phase boundaries: a menstrual window sized to the cycle,
// ovulation pinned ~14 days before the next period (the luteal phase is
// the part of the cycle that stays fairly constant in length), and a short
// ovulatory window around it. This is an estimate for meal-planning
// purposes, not a medical/fertility calculation.
export function phaseForDate(dateStr, settings) {
  if (!settings || !settings.enabled || !settings.startDate) return null;
  const { cycleDay, length } = cycleDayForDate(dateStr, settings.startDate, settings.avgCycleLength);

  const menstrualLen = Math.min(7, Math.max(3, Math.round(length * 0.18)));
  const ovulationDay = Math.max(menstrualLen + 1, length - 14);
  const ovulatoryStart = Math.max(menstrualLen + 1, ovulationDay - 1);
  const ovulatoryEnd = Math.min(length, ovulationDay + 1);

  let key;
  if (cycleDay <= menstrualLen) key = "menstrual";
  else if (cycleDay < ovulatoryStart) key = "follicular";
  else if (cycleDay <= ovulatoryEnd) key = "ovulatory";
  else key = "luteal";

  return { ...PHASES[key], cycleDay, cycleLength: length };
}
