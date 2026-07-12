import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getScenario } from "../api/scenarios";
import { getGoalsByScenario, createGoal, deleteGoal } from "../api/goals";
import GoalCard from "../components/GoalCard";
import AnalyticsTab from "../components/AnalyticsTab";
import VisionBoardTab from "../components/VisionBoardTab";

const TIME_FRAME_LABELS = {
  THREE_MONTHS: "3 mjeseca",
  SIX_MONTHS: "6 mjeseci",
  ONE_YEAR: "1 godina",
};

export default function ScenarioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "ciljevi";

  const [scenario, setScenario] = useState(null);
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", targetValue: "", targetUnit: ""
  });

  const loadGoals = () => {
    getGoalsByScenario(id).then(({ data }) => setGoals(data));
  };

  useEffect(() => {
    getScenario(id).then(({ data }) => setScenario(data));
    loadGoals();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createGoal({
      scenarioId: Number(id),
      title: form.title,
      description: form.description,
      category: form.category,
      targetValue: form.targetValue ? Number(form.targetValue) : null,
      targetUnit: form.targetUnit || null,
    });
    setForm({ title: "", description: "", category: "", targetValue: "", targetUnit: "" });
    setShowForm(false);
    loadGoals();
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Obrisati ovaj cilj i sva njegova ponašanja?")) return;
    await deleteGoal(goalId);
    loadGoals();
  };

  if (!scenario) return <p className="muted">Učitavanje...</p>;

  return (
    <div>
      <Link to="/" className="small">← Natrag na scenarije</Link>

      <div className="row-between" style={{ marginTop: 10 }}>
        <div>
          <h1>{scenario.title}</h1>
          {scenario.description && (
            <p className="muted" style={{ margin: "4px 0 0" }}>{scenario.description}</p>
          )}
          <p className="small" style={{ margin: "4px 0 0" }}>
            {new Date(scenario.startDate).toLocaleDateString("hr-HR")} → {new Date(scenario.targetDate).toLocaleDateString("hr-HR")}
            {"  "}<span className="badge" style={{ marginLeft: 8 }}>{TIME_FRAME_LABELS[scenario.timeFrame]}</span>
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => navigate(`/scenarios/${id}/edit`)}>
          ✏️ Uredi scenarij
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "ciljevi" ? "active" : ""}`}
          onClick={() => setSearchParams({ tab: "ciljevi" })}>Ciljevi</button>
        <button className={`tab ${tab === "analitika" ? "active" : ""}`}
          onClick={() => setSearchParams({ tab: "analitika" })}>Analitika</button>
        <button className={`tab ${tab === "visionboard" ? "active" : ""}`}
          onClick={() => setSearchParams({ tab: "visionboard" })}>Vision board</button>
      </div>

      {tab === "ciljevi" && (
        <>
          <div className="row-between" style={{ marginBottom: 14 }}>
            <h2>Ciljevi</h2>
            {!showForm && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                + Novi cilj
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card">
              <input name="title" className="input" placeholder="Naziv cilja (npr. Istrčati 10km)"
                value={form.title} onChange={handleChange} required />
              <input name="description" className="input" placeholder="Opis (opcionalno)"
                value={form.description} onChange={handleChange} />
              <div style={{ display: "flex", gap: 8 }}>
                <input name="category" className="input" placeholder="Kategorija (npr. zdravlje)"
                  value={form.category} onChange={handleChange} required style={{ flex: 1 }} />
                <input name="targetValue" type="number" step="any" className="input"
                  placeholder="Vrijednost" value={form.targetValue} onChange={handleChange}
                  style={{ width: 120 }} />
                <input name="targetUnit" className="input" placeholder="Jedinica"
                  value={form.targetUnit} onChange={handleChange} style={{ width: 110 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Spremi cilj</button>
                <button type="button" className="btn btn-sm" onClick={() => setShowForm(false)}>
                  Odustani
                </button>
              </div>
            </form>
          )}

          {goals.length === 0 && !showForm && (
            <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
              <div style={{ fontSize: 36 }}>🎯</div>
              <p className="muted">Još nema ciljeva. Dodaj prvi i razloži ga na konkretna ponašanja.</p>
            </div>
          )}

          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onDelete={handleDeleteGoal} />
          ))}
        </>
      )}

      {tab === "analitika" && <AnalyticsTab scenarioId={id} />}
      {tab === "visionboard" && <VisionBoardTab scenarioId={id} goals={goals} />}
    </div>
  );
}