import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getScenarios } from "../api/scenarios";
import { getScenarioProgress } from "../api/analytics";

const TIME_FRAME_LABELS = {
  THREE_MONTHS: "3 mjeseca",
  SIX_MONTHS: "6 mjeseci",
  ONE_YEAR: "1 godina",
};

export default function AnalyticsOverviewPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScenarios().then(async ({ data: scenarios }) => {
      const result = await Promise.all(
        scenarios.map(async (s) => {
          try {
            const { data: p } = await getScenarioProgress(s.id);
            const behaviors = p.goals.flatMap((g) => g.behaviors);
            const done = behaviors.reduce((sum, b) => sum + b.actualCount, 0);
            const expected = behaviors.reduce((sum, b) => sum + b.expectedCount, 0);
            const avgDev = behaviors.length
              ? Math.round(behaviors.reduce((sum, b) => sum + b.deviation, 0) / behaviors.length * 10) / 10
              : 0;
            return { scenario: s, rate: p.overallCompletionRate, done, expected, avgDev, goals: p.goals.length };
          } catch {
            return { scenario: s, rate: 0, done: 0, expected: 0, avgDev: 0, goals: 0 };
          }
        })
      );
      setRows(result);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="muted">Učitavanje...</p>;

  return (
    <div>
      <h1>Analitika 📊</h1>
      <p className="muted" style={{ margin: "4px 0 24px" }}>
        Pregled napretka po svim scenarijima. Klikni na scenarij za detaljnu analitiku.
      </p>

      {rows.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
          <div style={{ fontSize: 40 }}>📊</div>
          <p className="muted">Još nemaš scenarija za analizu. Kreiraj scenarij i dodaj mu ciljeve.</p>
        </div>
      )}

      {rows.map(({ scenario, rate, done, expected, avgDev, goals }) => (
        <div key={scenario.id} className="card" style={{ cursor: "pointer" }}
          onClick={() => navigate(`/scenarios/${scenario.id}?tab=analitika`)}>
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div>
              <h3>{scenario.title}</h3>
              <p className="small" style={{ margin: "2px 0 0" }}>
                {goals} {goals === 1 ? "cilj" : goals < 5 ? "cilja" : "ciljeva"} · {TIME_FRAME_LABELS[scenario.timeFrame]}
              </p>
            </div>
            <span className="small" style={{ color: "var(--green)", fontWeight: 600 }}>Detaljno →</span>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
            <div>
              <div className="stat-value green" style={{ fontSize: 22 }}>{rate}%</div>
              <div className="stat-label">Ukupno izvršenje</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>{done} / {expected}</div>
              <div className="stat-label">Odrađeno / planirano</div>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: 22, color: avgDev < 0 ? "var(--danger)" : "var(--green)" }}>
                {avgDev > 0 ? "+" : ""}{avgDev}%
              </div>
              <div className="stat-label">Prosječno odstupanje</div>
            </div>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${rate}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}