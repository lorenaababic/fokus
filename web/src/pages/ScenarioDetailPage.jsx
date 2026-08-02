import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getScenario, deleteScenario } from "../api/scenarios";
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
  const isNew = searchParams.get("novi") === "1";

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

  useEffect(() => {
    if (isNew) setShowForm(true);
  }, [isNew]);

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

  const handleDeleteScenario = async () => {
    if (!window.confirm(
      `Obrisati scenarij "${scenario.title}" sa svim ciljevima, ponašanjima i zapisima? Ova radnja je nepovratna.`
    )) return;
    await deleteScenario(id);
    navigate("/");
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
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm" onClick={() => navigate(`/scenarios/${id}/edit`)}>
            ✏️ Uredi scenarij
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDeleteScenario}>
            Obriši scenarij
          </button>
        </div>
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
          {isNew && (
            <div className="card" style={{ background: "var(--green-soft)", border: "none" }}>
              <strong style={{ fontSize: 14 }}>🎉 Scenarij je kreiran!</strong>
              <p className="small" style={{ margin: "4px 0 0" }}>
                Sad dodaj <strong>ciljeve</strong> ovom scenariju — konkretne, mjerljive ishode koje želiš postići
                (npr. „Istrčati 10 km"). Za svaki cilj kasnije dodaješ <strong>ponašanja</strong> koja te do njega vode.
              </p>
            </div>
          )}

          <div className="row-between" style={{ marginBottom: 14 }}>
            <div>
              <h2>Ciljevi</h2>
              <p className="small" style={{ margin: "2px 0 0" }}>
                Konkretni, mjerljivi ishodi unutar ovog scenarija.
              </p>
            </div>
            {!showForm && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
                + Novi cilj
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card">
              <label className="label">Naziv cilja</label>
              <input name="title" className="input"
                placeholder="npr. Istrčati 10 km, Smršavjeti 5 kg, Naučiti React"
                value={form.title} onChange={handleChange} required />

              <label className="label">Opis (nije obavezno)</label>
              <input name="description" className="input" placeholder="Dodatni detalji o cilju"
                value={form.description} onChange={handleChange} />

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Kategorija</label>
                  <input name="category" className="input" placeholder="npr. zdravlje"
                    value={form.category} onChange={handleChange} required />
                </div>
                <div style={{ width: 120 }}>
                  <label className="label">Ciljna vrijednost</label>
                  <input name="targetValue" type="number" step="any" className="input"
                    placeholder="npr. 10" value={form.targetValue} onChange={handleChange} />
                </div>
                <div style={{ width: 110 }}>
                  <label className="label">Jedinica</label>
                  <input name="targetUnit" className="input" placeholder="npr. km"
                    value={form.targetUnit} onChange={handleChange} />
                </div>
              </div>

              <p className="small" style={{ margin: "0 0 12px" }}>
                Ciljna vrijednost i jedinica nisu obavezne — koristi ih ako je cilj brojčano mjerljiv.
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Spremi cilj</button>
                <button type="button" className="btn btn-sm" onClick={() => setShowForm(false)}>
                  Odustani
                </button>
              </div>
            </form>
          )}

          {goals.length === 0 && !showForm && (
            <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ fontSize: 36 }}>🎯</div>
              <h3 style={{ margin: "10px 0 4px" }}>Dodaj prvi cilj</h3>
              <p className="muted" style={{ maxWidth: 420, margin: "0 auto 16px" }}>
                Cilj je konkretan, mjerljiv ishod koji želiš postići u ovom scenariju — na primjer
                „Istrčati 10 km". Nakon što ga dodaš, razložit ćeš ga na svakodnevna ponašanja.
              </p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Dodaj cilj
              </button>
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