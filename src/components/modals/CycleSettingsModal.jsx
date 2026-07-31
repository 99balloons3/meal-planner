import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { PHASE_ORDER, PHASES } from "../../lib/cycle";

const MIN_CYCLE_LENGTH = 15;
const MAX_CYCLE_LENGTH = 45;

export default function CycleSettingsModal({ cycle, onClose }) {
  const { settings, setEnabled, setStartDate, setAvgCycleLength } = cycle;

  // Free-typed text, kept separate from the committed number so a value
  // like "3" (on the way to "30") isn't clamped to 15 mid-keystroke.
  const [cycleLengthText, setCycleLengthText] = useState(String(settings?.avgCycleLength ?? ""));

  useEffect(() => {
    setCycleLengthText(String(settings?.avgCycleLength ?? ""));
  }, [settings?.avgCycleLength]);

  if (!settings) return null;

  function commitCycleLength() {
    const parsed = parseInt(cycleLengthText, 10);
    const clamped = Number.isFinite(parsed)
      ? Math.max(MIN_CYCLE_LENGTH, Math.min(MAX_CYCLE_LENGTH, parsed))
      : settings.avgCycleLength;
    setCycleLengthText(String(clamped));
    if (clamped !== settings.avgCycleLength) setAvgCycleLength(clamped);
  }

  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2" style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Sparkles size={17} /> Cycle-sync
        </div>
        <p className="mp-sub">
          Optional — plan around your cycle phase. Everything here is private to your account.
        </p>

        <label className="mp-checkbox-inline" style={{ marginBottom: 16 }}>
          <span
            className={`mp-checkbox ${settings.enabled ? "checked" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setEnabled(!settings.enabled)}
          >
            {settings.enabled && <Check size={11} color="#fff" />}
          </span>
          Enable cycle-sync
        </label>

        <div className="mp-form-row">
          <div style={{ flex: 1 }}>
            <label className="mp-label">Last period start date</label>
            <input
              type="date"
              className="mp-input"
              value={settings.startDate || ""}
              onChange={(e) => setStartDate(e.target.value || null)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Average cycle length (days)</label>
            <input
              type="number"
              min={MIN_CYCLE_LENGTH}
              max={MAX_CYCLE_LENGTH}
              className="mp-input"
              value={cycleLengthText}
              onChange={(e) => setCycleLengthText(e.target.value)}
              onBlur={commitCycleLength}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
            />
          </div>
        </div>

        <label className="mp-label" style={{ marginTop: 10 }}>Food guide by phase</label>
        <p className="mp-sub" style={{ marginBottom: 10 }}>
          General nutrients that tend to help, with a few example foods to get you started —
          not a strict rule.
        </p>

        {PHASE_ORDER.map((phaseKey) => {
          const phase = PHASES[phaseKey];
          return (
            <div key={phaseKey} className="mp-index-card" style={{ padding: "10px 12px 12px 26px", marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                {phase.emoji} {phase.label} — {phase.description}
              </div>
              <div className="mp-recipe-tags">
                {phase.foods.map((food) => (
                  <span key={food} className="mp-tag">{food}</span>
                ))}
              </div>
            </div>
          );
        })}

        <button
          className="mp-btn mp-btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
