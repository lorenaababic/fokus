import { useEffect, useState } from "react";
import { getBehaviorsByGoal, createBehavior, deleteBehavior } from "../api/goals";

const FREQUENCY_LABELS = { DAILY: "dnevno", WEEKLY: "tjedno" };

export default function BehaviorList({ goalId }) {
  const [behaviors, setBehaviors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", frequency: "WEEKLY", targetCount: 3 });

  const load = () => {
    getBehaviorsByGoal(goalId).then(({ data }) => setBehaviors(data));
  };

  useEffect(load, [goalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createBehavior({ goalId, ...form, targetCount: Number(form.targetCount) });
    setForm({ title: "", frequency: "WEEKLY", targetCount: 3 });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati ovo ponašanje i sve njegove zapise?")) return;
    await deleteBehavior(id);
    load();
  };

  return (
    <div>
      {behaviors.map((b) => (
        <div key={b.id} className="row-between" style={{
          background: "var(--bg)", borderRadius: "var(--radius)",
          padding: "9px 14px", marginBottom: 6
        }}>
          <span style={{ fontSize: 13.5 }}>
            <strong>{b.title}</strong>
            <span className="muted"> — {b.targetCount}x {FREQUENCY_LABELS[b.frequency]}</span>
          </span>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>✕</button>
        </div>
      ))}

      {behaviors.length === 0 && !showForm && (
        <p className="small" style={{ margin: "0 0 8px" }}>
          Ponašanje je ponavljiva radnja koja te vodi cilju — npr. „Trčanje 3× tjedno".
        </p>
      )}

      {!showForm && (
        <button className="btn btn-sm" onClick={() => setShowForm(true)}>
          + Dodaj ponašanje
        </button>
      )}

      {showForm && (
        <div style={{ marginTop: 4 }}>
          <p className="small" style={{ margin: "0 0 8px" }}>
            Upiši radnju, koliko puta i koliko često je želiš ponavljati (npr. Trčanje — 3 — tjedno).
          </p>
          <form onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 2, minWidth: 130 }}>
              <label className="label" style={{ marginBottom: 3 }}>Radnja</label>
              <input className="input" placeholder="npr. Trčanje" value={form.title} required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ marginBottom: 0 }} />
            </div>
            <div style={{ width: 80 }}>
              <label className="label" style={{ marginBottom: 3 }}>Koliko puta</label>
              <input className="input" type="number" min="1" value={form.targetCount} required
                onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
                style={{ marginBottom: 0 }} />
            </div>
            <div style={{ width: 110 }}>
              <label className="label" style={{ marginBottom: 3 }}>Koliko često</label>
              <select className="select" value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                style={{ marginBottom: 0 }}>
                <option value="DAILY">dnevno</option>
                <option value="WEEKLY">tjedno</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Spremi</button>
            <button type="button" className="btn btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </form>
        </div>
      )}
    </div>
  );
}