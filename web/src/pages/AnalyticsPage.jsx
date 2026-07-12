import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getScenarioProgress, getBehaviorTimeline } from "../api/analytics";

export default function AnalyticsPage() {
  const { id } = useParams();
  const [progress, setProgress] = useState(null);
  const [selectedBehavior, setSelectedBehavior] = useState(null);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    getScenarioProgress(id).then(({ data }) => {
      setProgress(data);
      const firstBehavior = data.goals[0]?.behaviors[0];
      if (firstBehavior) setSelectedBehavior(firstBehavior.behaviorId);
    });
  }, [id]);

  useEffect(() => {
    if (!selectedBehavior) return;
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10); // zadnjih 8 tjedana
    getBehaviorTimeline(selectedBehavior, from, to).then(({ data }) => setTimeline(data));
  }, [selectedBehavior]);

  if (!progress) return <p style={{ padding: 24 }}>Učitavanje...</p>;

  const goalChartData = progress.goals.map((g) => ({
    name: g.goalTitle,
    "Izvršenje (%)": g.completionRate,
  }));

  const allBehaviors = progress.goals.flatMap((g) =>
    g.behaviors.map((b) => ({ ...b, goalTitle: g.goalTitle }))
  );

  const timelineData = timeline?.weeks.map((w) => ({
    tjedan: w.weekStart.slice(5), // MM-DD
    Planirano: w.expected,
    Odrađeno: w.actual,
  }));

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <Link to={`/scenarios/${id}`}>← Natrag na scenarij</Link>
      <h1>Analitika: {progress.scenarioTitle}</h1>

      <div style={{
        background: "#f0f0ff", borderRadius: 8, padding: 20,
        textAlign: "center", marginBottom: 24
      }}>
        <div style={{ fontSize: 40, fontWeight: "bold" }}>
          {progress.overallCompletionRate}%
        </div>
        <div>ukupno izvršenje scenarija</div>
      </div>

      <h2>Izvršenje po ciljevima</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={goalChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="Izvršenje (%)" fill="#7c7cf0" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <h2>Tablica odstupanja</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
            <th style={{ padding: 10 }}>Ponašanje</th>
            <th style={{ padding: 10 }}>Cilj</th>
            <th style={{ padding: 10 }}>Planirano</th>
            <th style={{ padding: 10 }}>Odrađeno</th>
            <th style={{ padding: 10 }}>Izvršenje</th>
            <th style={{ padding: 10 }}>Odstupanje</th>
          </tr>
        </thead>
        <tbody>
          {allBehaviors.map((b) => (
            <tr key={b.behaviorId} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 10 }}>{b.behaviorTitle}</td>
              <td style={{ padding: 10, color: "#666" }}>{b.goalTitle}</td>
              <td style={{ padding: 10 }}>{b.expectedCount}</td>
              <td style={{ padding: 10 }}>{b.actualCount}</td>
              <td style={{ padding: 10 }}>{b.completionRate}%</td>
              <td style={{
                padding: 10,
                color: b.deviation >= 0 ? "green" : "#c0392b",
                fontWeight: "bold"
              }}>
                {b.deviation > 0 ? "+" : ""}{b.deviation}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Tjedni trend ponašanja</h2>
      <select value={selectedBehavior ?? ""} onChange={(e) => setSelectedBehavior(Number(e.target.value))}
        style={{ padding: 8, marginBottom: 16 }}>
        {allBehaviors.map((b) => (
          <option key={b.behaviorId} value={b.behaviorId}>
            {b.behaviorTitle} ({b.goalTitle})
          </option>
        ))}
      </select>

      {timelineData && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tjedan" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Planirano" stroke="#999" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="Odrađeno" stroke="#7c7cf0" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}