export const PHASES = {
  menstrual: {
    key: "menstrual",
    label: "Menstrual",
    emoji: "🩸",
    description: "Lower energy — iron-rich, warming, easy-to-digest foods can help.",
  },
  follicular: {
    key: "follicular",
    label: "Follicular",
    emoji: "🌱",
    description: "Rising energy — lighter, fresh foods to match building energy.",
  },
  ovulatory: {
    key: "ovulatory",
    label: "Ovulatory",
    emoji: "☀️",
    description: "Peak energy — fresh, vibrant, high-fiber foods.",
  },
  luteal: {
    key: "luteal",
    label: "Luteal",
    emoji: "🌙",
    description: "Winding down — more grounding, complex carbs can help with cravings.",
  },
};

export const PHASE_ORDER = ["menstrual", "follicular", "ovulatory", "luteal"];

export const DEFAULT_MACRO_TARGETS = {
  menstrual: { calories: 2100, carbs: 250, protein: 90, fat: 80 },
  follicular: { calories: 2000, carbs: 230, protein: 100, fat: 65 },
  ovulatory: { calories: 2050, carbs: 220, protein: 105, fat: 70 },
  luteal: { calories: 2250, carbs: 270, protein: 95, fat: 85 },
};

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

export function macroTargetsFor(settings, phaseKey) {
  const defaults = DEFAULT_MACRO_TARGETS[phaseKey] || {};
  const overrides = settings?.macroTargets?.[phaseKey] || {};
  return { ...defaults, ...overrides };
}
