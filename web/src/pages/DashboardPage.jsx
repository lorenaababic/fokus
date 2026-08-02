import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getScenarios } from "../api/scenarios";
import { getAllMyBehaviors, getLogs } from "../api/logs";
import { getScenarioProgress } from "../api/analytics";
import { getGoalsByScenario } from "../api/goals";

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
  const [goalCounts, setGoalCounts] = useState({});
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
      const counts = {};
      await Promise.all(
        data.map(async (s) => {
          const { data: goals } = await getGoalsByScenario(s.id);
          counts[s.id] = goals.length;
        })
      );
      setGoalCounts(counts);
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

  const hasScenarios = scenarios.length > 0;

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
        {hasScenarios && (
          <button className="btn btn-primary" onClick={() => navigate("/scenarios/new")}>
            + Novi scenarij
          </button>
        )}
      </div>
      
      {!hasScenarios && (
        <div className="card" style={{ padding: "36px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40 }}>🌱</div>
            <h2 style={{ margin: "10px 0 4px" }}>Dobro došli u FOKUS!</h2>
            <p className="muted" style={{ margin: 0 }}>
              FOKUS ti pomaže pretvoriti velike želje u svakodnevne navike. Evo kako je sve posloženo:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 460, margin: "0 auto 24px" }}>
            <div className="row-between" style={{ background: "var(--green-soft)", borderRadius: 12, padding: "12px 16px" }}>
              <div>
                <strong>1. Scenarij</strong>
                <p className="small" style={{ margin: "2px 0 0" }}>Šire životno područje — npr. „Zdraviji život"</p>
              </div>
              <span style={{ fontSize: 22 }}>🎯</span>
            </div>
            <div className="row-between" style={{ background: "var(--green-soft)", borderRadius: 12, padding: "12px 16px" }}>
              <div>
                <strong>2. Cilj</strong>
                <p className="small" style={{ margin: "2px 0 0" }}>Konkretan ishod unutar scenarija — npr. „Istrčati 10 km"</p>
              </div>
              <span style={{ fontSize: 22 }}>📌</span>
            </div>
            <div className="row-between" style={{ background: "var(--green-soft)", borderRadius: 12, padding: "12px 16px" }}>
              <div>
                <strong>3. Ponašanje</strong>
                <p className="small" style={{ margin: "2px 0 0" }}>Radnja koju ponavljaš — npr. „Trčanje 3× tjedno"</p>
              </div>
              <span style={{ fontSize: 22 }}>🔁</span>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="btn btn-primary" onClick={() => navigate("/scenarios/new")}>
              Kreiraj svoj prvi scenarij →
            </button>
          </div>
        </div>
      )}

      {hasScenarios && (
        <>
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

          {scenarios.map((s) => {
            const count = goalCounts[s.id];
            return (
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
                  <div className="row-between" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <span className="small">
                      {count === undefined ? "—" : count === 0
                        ? "Još nema ciljeva — klikni za dodavanje"
                        : `${count} ${count === 1 ? "cilj" : count < 5 ? "cilja" : "ciljeva"}`}
                    </span>
                    <span className="small" style={{ color: "var(--green)", fontWeight: 600 }}>Otvori →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
}