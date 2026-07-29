import { useState } from "react";
import { Check } from "lucide-react";
import { SECTIONS } from "../../lib/constants";

export default function AddItemModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [section, setSection] = useState("Produce");
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2">Add item</div>
        <label className="mp-label">Item name</label>
        <input className="mp-input" style={{ marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="paper towels" />
        <div className="mp-form-row" style={{ marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Amount (optional)</label>
            <input className="mp-input" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1 roll" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="mp-label">Section</label>
            <select className="mp-select" value={section} onChange={(e) => setSection(e.target.value)}>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="mp-btn mp-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onAdd(name, qty, section)} disabled={!name.trim()}>
          <Check size={15} /> Add to list
        </button>
      </div>
    </div>
  );
}
