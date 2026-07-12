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

      {!showForm && (
        <button className="btn btn-sm" onClick={() => setShowForm(true)}>
          + Dodaj ponašanje
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          <input className="input" placeholder="npr. Trčanje" value={form.title} required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ flex: 2, minWidth: 130, marginBottom: 0 }} />
          <input className="input" type="number" min="1" value={form.targetCount} required
            onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
            style={{ width: 70, marginBottom: 0 }} />
          <select className="select" value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            style={{ width: "auto", marginBottom: 0 }}>
            <option value="DAILY">dnevno</option>
            <option value="WEEKLY">tjedno</option>
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Spremi</button>
          <button type="button" className="btn btn-sm" onClick={() => setShowForm(false)}>✕</button>
        </form>
      )}
    </div>
  );
}