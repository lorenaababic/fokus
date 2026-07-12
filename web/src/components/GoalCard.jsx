import { useState } from "react";
import BehaviorList from "./BehaviorList";
import { getAiBehaviorSuggestions } from "../api/ai";
import { createBehavior } from "../api/goals";

const FREQUENCY_LABELS = { DAILY: "dnevno", WEEKLY: "tjedno" };

export default function GoalCard({ goal, onDelete }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAiSuggest = async () => {
    setLoadingAi(true);
    try {
      const { data } = await getAiBehaviorSuggestions(goal.id);
      setSuggestions(data);
    } catch {
      alert("AI prijedlozi trenutno nisu dostupni.");
    } finally {
      setLoadingAi(false);
    }
  };

  const acceptSuggestion = async (s) => {
    await createBehavior({
      goalId: goal.id,
      title: s.title,
      frequency: s.frequency,
      targetCount: s.targetCount,
    });
    setSuggestions(suggestions.filter((x) => x !== s));
    setRefreshKey((k) => k + 1);
  };

  const rejectSuggestion = (s) => {
    setSuggestions(suggestions.filter((x) => x !== s));
  };

  return (
    <div className="card">
      <div className="row-between">
        <h3>{goal.title}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge">{goal.category}</span>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(goal.id)}>
            Obriši
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="muted" style={{ margin: "6px 0 0" }}>{goal.description}</p>
      )}
      {goal.targetValue && (
        <p className="small" style={{ margin: "4px 0 0" }}>
          Cilj: {goal.targetValue} {goal.targetUnit}
        </p>
      )}

      <p className="label" style={{ margin: "14px 0 8px" }}>Ponašanja</p>
      <BehaviorList goalId={goal.id} key={refreshKey} />

      <button className="btn btn-gold btn-sm" style={{ marginTop: 10 }}
        onClick={handleAiSuggest} disabled={loadingAi}>
        {loadingAi ? "AI razmišlja..." : "✨ AI prijedlozi ponašanja"}
      </button>

      {suggestions.map((s, i) => (
        <div key={i} className="row-between" style={{
          background: "var(--gold-soft)", borderRadius: "var(--radius)",
          padding: "9px 14px", marginTop: 8
        }}>
          <span style={{ fontSize: 13.5 }}>
            ✨ {s.title} — {s.targetCount}x {FREQUENCY_LABELS[s.frequency] ?? s.frequency}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-sm btn-primary" onClick={() => acceptSuggestion(s)}>
              ✔ Dodaj
            </button>
            <button className="btn btn-sm" onClick={() => rejectSuggestion(s)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}