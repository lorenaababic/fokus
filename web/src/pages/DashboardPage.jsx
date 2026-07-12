import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getScenarios } from "../api/scenarios";
import { getAllMyBehaviors, getLogs } from "../api/logs";
import { getScenarioProgress } from "../api/analytics";

const TIME_FRAME_LABELS = {
  THREE_MONTHS: "3 mjeseca",
  SIX_MONTHS: "6 mjeseci",
  ONE_YEAR: "1 godina",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Dobro jutro";
  if (h < 18) return "Dobar dan";
  return "Dobra večer";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [progress, setProgress] = useState(null);
  const [checkinStats, setCheckinStats] = useState({ done: 0, total: 0 });

  useEffect(() => {
    getScenarios().then(async ({ data }) => {
      setScenarios(data);
      const active = data.find((s) => s.status === "ACTIVE") ?? data[0];
      if (active) {
        getScenarioProgress(active.id).then(({ data: p }) =>
          setProgress({ ...p, scenario: active }));
      }
    });

    const today = new Date().toISOString().slice(0, 10);
    getAllMyBehaviors().then(async ({ data: behaviors }) => {
      let done = 0;
      await Promise.all(
        behaviors.map(async (b) => {
          const { data } = await getLogs(b.id, today, today);
          if (data.length > 0) done++;
        })
      );
      setCheckinStats({ done, total: behaviors.length });
    });
  }, []);

  const today = new Date().toLocaleDateString("hr-HR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 24 }}>
        <div>
          <p className="small" style={{ margin: 0, textTransform: "capitalize" }}>{today}</p>
          <h1>{greeting()}, {user?.firstName} 👋</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Mali koraci svaki dan vode do velikih promjena.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/scenarios/new")}>
          + Novi scenarij
        </button>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Dnevni pregled</h3>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="muted">✅ Check-in danas</span>
            <strong>{checkinStats.done} / {checkinStats.total}</strong>
          </div>
          <div className="progress-track" style={{ marginBottom: 14 }}>
            <div className="progress-fill" style={{
              width: checkinStats.total ? `${(checkinStats.done / checkinStats.total) * 100}%` : "0%"
            }} />
          </div>
          <button className="btn btn-gold btn-sm btn-block" onClick={() => navigate("/checkin")}>
            Otvori check-in
          </button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Trenutni fokus</h3>
          {progress ? (
            <>
              <Link to={`/scenarios/${progress.scenario.id}`}>
                <strong>{progress.scenarioTitle}</strong>
              </Link>
              {progress.scenario.description && (
                <p className="small" style={{ margin: "2px 0 0" }}>{progress.scenario.description}</p>
              )}
              <div className="progress-row">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress.overallCompletionRate}%` }} />
                </div>
                <span className="progress-pct">{progress.overallCompletionRate}%</span>
              </div>
            </>
          ) : (
            <p className="muted">Nema aktivnog scenarija.</p>
          )}
        </div>

        <div className="ai-card">
          <div className="ai-card-title">✨ AI uvid</div>
          {progress && progress.overallCompletionRate >= 50 ? (
            <p className="muted" style={{ margin: 0 }}>
              Odlično! Izvršenje ti je {progress.overallCompletionRate}% — nastavi ovim tempom.
            </p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              Dodaj ciljeve i ponašanja pa zatraži AI prijedloge na kartici cilja.
            </p>
          )}
        </div>
      </div>

      <div className="row-between" style={{ margin: "26px 0 12px" }}>
        <h2>Moji scenariji</h2>
      </div>

      {scenarios.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
          <div style={{ fontSize: 40 }}>🌱</div>
          <h3 style={{ margin: "10px 0 4px" }}>Još nemaš nijedan scenarij</h3>
          <p className="muted" style={{ marginBottom: 16 }}>
            Kreiraj prvi scenarij i pretvori viziju u konkretne korake.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/scenarios/new")}>
            Kreiraj scenarij
          </button>
        </div>
      )}

      {scenarios.map((s) => (
        <Link key={s.id} to={`/scenarios/${s.id}`} style={{ display: "block", color: "inherit" }}>
          <div className="card" style={{ cursor: "pointer" }}>
            <div className="row-between">
              <div>
                <h3>{s.title}</h3>
                {s.description && <p className="muted" style={{ margin: "2px 0 0" }}>{s.description}</p>}
                <p className="small" style={{ margin: "4px 0 0" }}>
                  {new Date(s.startDate).toLocaleDateString("hr-HR")} → {new Date(s.targetDate).toLocaleDateString("hr-HR")}
                </p>
              </div>
              <span className="badge">{TIME_FRAME_LABELS[s.timeFrame]}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}