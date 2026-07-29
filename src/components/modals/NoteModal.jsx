import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { fmtShort } from "../../lib/date";

export default function NoteModal({ dateStr, initialNote, onClose, onSave }) {
  const [draft, setDraft] = useState(initialNote);
  return (
    <div className="mp-modal-backdrop" onClick={onClose}>
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mp-modal-handle" />
        <div className="mp-h2" style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <NotebookPen size={17} /> Prep notes
        </div>
        <p className="mp-sub">{fmtShort(new Date(dateStr + "T00:00:00"))}</p>
        <textarea
          className="mp-textarea"
          rows={4}
          placeholder="Chop veggies ahead, marinate chicken, thaw the salmon…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          className="mp-btn mp-btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
          onClick={() => onSave(draft)}
        >
          Save note
        </button>
      </div>
    </div>
  );
}
