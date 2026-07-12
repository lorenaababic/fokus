import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getScenarioProgress, getBehaviorTimeline } from "../api/analytics";

export default function AnalyticsTab({ scenarioId }) {
  const [progress, setProgress] = useState(null);
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    getScenarioProgress(scenarioId).then(({ data }) => {
      setProgress(data);
      const first = data.goals[0]?.behaviors[0];
      if (first) setSelectedBehavior(first.behaviorId);
    });
  }, [scenarioId]);

  useEffect(() => {
    if (!selectedBehavior) return;
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    getBehaviorTimeline(selectedBehavior, from, to).then(({ data }) => setTimeline(data));
  }, [selectedBehavior]);

  if (!progress) return <p className="muted">Učitavanje...</p>;

  const allBehaviors = progress.goals.flatMap((g) =>
    g.behaviors.map((b) => ({ ...b, goalTitle: g.goalTitle }))
  );

  const totalDone = allBehaviors.reduce((s, b) => s + b.actualCount, 0);
  const totalExpected = allBehaviors.reduce((s, b) => s + b.expectedCount, 0);
  const avgDeviation = allBehaviors.length
    ? Math.round(allBehaviors.reduce((s, b) => s + b.deviation, 0) / allBehaviors.length * 10) / 10
    : 0;

  const goalChartData = progress.goals.map((g) => ({
    name: g.goalTitle,
    "Izvršenje (%)": g.completionRate,
  }));

  const timelineData = timeline?.weeks.map((w) => ({
    tjedan: w.weekStart.slice(5),
    Planirano: w.expected,
    Odrađeno: w.actual,
  }));

  return (
    <div>
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value green">{progress.overallCompletionRate}%</div>
          <div className="stat-label">Ukupno izvršenje scenarija</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDone} / {totalExpected}</div>
          <div className="stat-label">Odrađene aktivnosti</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${avgDeviation < 0 ? "red" : "green"}`}>
            {avgDeviation > 0 ? "+" : ""}{avgDeviation}%
          </div>
          <div className="stat-label">Prosječno odstupanje</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Izvršenje po ciljevima</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={goalChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E1" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="Izvršenje (%)" fill="#244A42" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Tablica odstupanja</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Ponašanje</th><th>Cilj</th><th>Planirano</th>
              <th>Odrađeno</th><th>Izvršenje</th><th>Odstupanje</th>
            </tr>
          </thead>
          <tbody>
            {allBehaviors.map((b) => (
              <tr key={b.behaviorId}>
                <td><strong>{b.behaviorTitle}</strong></td>
                <td className="muted">{b.goalTitle}</td>
                <td>{b.expectedCount}</td>
                <td>{b.actualCount}</td>
                <td>{b.completionRate}%</td>
                <td style={{
                  color: b.deviation >= 0 ? "var(--success)" : "var(--danger)",
                  fontWeight: 600
                }}>
                  {b.deviation > 0 ? "+" : ""}{b.deviation}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: 14 }}>
          <h3>Tjedni trend ponašanja</h3>
          <select className="select" style={{ width: "auto", marginBottom: 0 }}
            value={selectedBehavior ?? ""}
            onChange={(e) => setSelectedBehavior(Number(e.target.value))}>
            {allBehaviors.map((b) => (
              <option key={b.behaviorId} value={b.behaviorId}>
                {b.behaviorTitle} ({b.goalTitle})
              </option>
            ))}
          </select>
        </div>
        {timelineData && (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E1" />
              <XAxis dataKey="tjedan" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Planirano" stroke="#9CA39E" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="Odrađeno" stroke="#244A42" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}