import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllMyBehaviors, getLogs, createLog, deleteLog } from "../api/logs";

const FREQUENCY_LABELS = { DAILY: "dnevno", WEEKLY: "tjedno" };

export default function CheckInPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [behaviors, setBehaviors] = useState([]);
  const [logs, setLogs] = useState({});
  const [note, setNote] = useState({});

  const load = async (selectedDate) => {
    const { data: behaviorList } = await getAllMyBehaviors();
    setBehaviors(behaviorList);
    const logMap = {};
    await Promise.all(
      behaviorList.map(async (b) => {
        const { data } = await getLogs(b.id, selectedDate, selectedDate);
        if (data.length > 0) logMap[b.id] = data[0];
      })
    );
    setLogs(logMap);
  };

  useEffect(() => { load(date); }, [date]);

  const toggle = async (behavior) => {
    const existing = logs[behavior.id];
    if (existing) {
      await deleteLog(existing.id);
    } else {
      await createLog({
        behaviorId: behavior.id, date, completed: true,
        note: note[behavior.id] || null,
      });
    }
    load(date);
  };

  const doneCount = Object.keys(logs).length;

  return (
    <div style={{ maxWidth: 620 }}>
      <Link to="/" className="small">← Natrag na scenarije</Link>
      <h1 style={{ marginTop: 10 }}>Dnevni check-in ✅</h1>
      <p className="muted" style={{ margin: "4px 0 20px" }}>
        Zabilježi svoje aktivnosti za danas.
      </p>

      <div className="card">
        <div className="row-between">
          <div>
            <span className="label" style={{ marginBottom: 0 }}>Datum</span>
            <input type="date" className="input" value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ marginBottom: 0, width: "auto" }} />
          </div>
          {behaviors.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div className="stat-value green" style={{ fontSize: 22 }}>
                {doneCount} / {behaviors.length}
              </div>
              <div className="stat-label">odrađeno</div>
            </div>
          )}
        </div>
        <div className="progress-track" style={{ marginTop: 12 }}>
          <div className="progress-fill" style={{
            width: behaviors.length ? `${(doneCount / behaviors.length) * 100}%` : "0%"
          }} />
        </div>
      </div>

      {behaviors.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <p className="muted">Nemaš još ponašanja — otvori scenarij i dodaj ciljeve s ponašanjima. 🎯</p>
        </div>
      )}

      {behaviors.map((b) => {
        const done = Boolean(logs[b.id]);
        return (
          <div key={b.id} className={`checkin-item ${done ? "done" : ""}`}>
            <input type="checkbox" checked={done} onChange={() => toggle(b)} />
            <div style={{ flex: 1 }}>
              <strong style={{ textDecoration: done ? "line-through" : "none" }}>
                {b.title}
              </strong>
              <div className="small">{b.targetCount}x {FREQUENCY_LABELS[b.frequency]}</div>
              {logs[b.id]?.note && (
                <div className="small" style={{ fontStyle: "italic" }}>📝 {logs[b.id].note}</div>
              )}
            </div>
            {!done && (
              <input className="input" placeholder="bilješka (opcionalno)"
                value={note[b.id] || ""}
                onChange={(e) => setNote({ ...note, [b.id]: e.target.value })}
                style={{ width: 170, marginBottom: 0, fontSize: 13 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}