import { Check, RotateCcw, Sparkles } from "lucide-react";
import { PHASE_ORDER, PHASES, macroTargetsFor } from "../../lib/cycle";

const MACRO_FIELDS = [
  { key: "calories", label: "kcal" },
  { key: "carbs", label: "carbs (g)" },
  { key: "protein", label: "protein (g)" },
  { key: "fat", label: "fat (g)" },
];

export default function CycleSettingsModal({ cycle, onClose }) {
  const { settings, setEnabled, setStartDate, setAvgCycleLength, setMacroTarget, resetMacroTargets } = cycle;
  if (!settings) return null;

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
            <label className="mp-label">Average cycle length</label>
            <input
              type="number"
              min={15}
              max={45}
              className="mp-input"
              value={settings.avgCycleLength}
              onChange={(e) => setAvgCycleLength(Math.max(15, Math.min(45, Number(e.target.value) || 28)))}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8 }}>
          <label className="mp-label" style={{ marginBottom: 0 }}>Daily macro targets by phase</label>
          <button className="mp-btn-ghost" style={{ fontSize: 11.5, color: "var(--ink-soft)" }} onClick={resetMacroTargets}>
            <RotateCcw size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
            Reset to defaults
          </button>
        </div>

        {PHASE_ORDER.map((phaseKey) => {
          const phase = PHASES[phaseKey];
          const targets = macroTargetsFor(settings, phaseKey);
          return (
            <div key={phaseKey} className="mp-index-card" style={{ padding: "10px 12px 12px 26px", marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                {phase.emoji} {phase.label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {MACRO_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="mp-label" style={{ fontSize: 10, marginBottom: 3 }}>{f.label}</label>
                    <input
                      type="number"
                      min={0}
                      className="mp-input"
                      style={{ padding: "6px 8px", fontSize: 12.5 }}
                      value={targets[f.key]}
                      onChange={(e) =>
                        setMacroTarget(phaseKey, { ...targets, [f.key]: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
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
