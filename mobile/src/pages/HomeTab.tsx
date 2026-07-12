import { useEffect, useState, useCallback } from "react";
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent
} from "@ionic/react";
import { useAuth } from "../context/AuthContext";
import { getScenarios } from "../api/scenarios";
import { getScenarioProgress } from "../api/analytics";
import { getAllMyBehaviors, getLogs, createLog, deleteLog } from "../api/logs";

interface Behavior {
  id: number;
  title: string;
  frequency: "DAILY" | "WEEKLY";
  targetCount: number;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Dobro jutro";
  if (h < 18) return "Dobar dan";
  return "Dobra večer";
}

export default function HomeTab() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [logs, setLogs] = useState<Record<number, any>>({});
  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    const { data: scenarios } = await getScenarios();
    const active = scenarios.find((s: any) => s.status === "ACTIVE") ?? scenarios[0];
    if (active) {
      const { data: p } = await getScenarioProgress(active.id);
      setProgress({ ...p, scenario: active });
    }

    const { data: behaviorList } = await getAllMyBehaviors();
    setBehaviors(behaviorList);
    const logMap: Record<number, any> = {};
    await Promise.all(
      behaviorList.map(async (b: Behavior) => {
        const { data } = await getLogs(b.id, today, today);
        if (data.length > 0) logMap[b.id] = data[0];
      })
    );
    setLogs(logMap);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (b: Behavior) => {
    const existing = logs[b.id];
    if (existing) {
      await deleteLog(existing.id);
    } else {
      await createLog({ behaviorId: b.id, date: today, completed: true, note: null });
    }
    load();
  };

  const doneCount = Object.keys(logs).length;
  const todayLabel = new Date().toLocaleDateString("hr-HR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: "calc(env(safe-area-inset-top, 24px) + 20px) 16px 8px" }}>
          <p className="small" style={{ margin: 0, textTransform: "capitalize" }}>{todayLabel}</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 600 }}>
            {greeting()},<br />{user?.firstName} 👋
          </h1>
        </div>

        <div className="fokus-card-dark">
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            ✅ Danas odrađeno {doneCount} / {behaviors.length}
          </div>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {doneCount === behaviors.length && behaviors.length > 0
              ? "Sve odrađeno — bravo! 🎉"
              : "Nastavi tako, svaki korak se broji."}
          </p>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: behaviors.length ? `${(doneCount / behaviors.length) * 100}%` : "0%"
            }} />
          </div>
        </div>

        {progress && (
          <div className="fokus-card">
            <p className="small" style={{ margin: "0 0 4px" }}>Trenutni fokus</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 15 }}>{progress.scenarioTitle}</strong>
              <span className="pct-badge">{progress.overallCompletionRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress.overallCompletionRate}%` }} />
            </div>
          </div>
        )}

        <div className="fokus-card">
          <p className="small" style={{ margin: "0 0 10px" }}>
            Današnje aktivnosti · {doneCount}/{behaviors.length} odrađeno
          </p>
          {behaviors.length === 0 && (
            <p className="muted" style={{ margin: 0 }}>
              Nemaš još ponašanja — dodaj ih kroz web aplikaciju. 🎯
            </p>
          )}
          {behaviors.map((b) => {
            const done = Boolean(logs[b.id]);
            return (
              <div key={b.id} onClick={() => toggle(b)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 12px", borderRadius: 12, marginBottom: 6,
                background: done ? "#E8EFEC" : "#F7F5F2", cursor: "pointer"
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  border: done ? "none" : "2px solid #C9CFC9",
                  background: done ? "#244A42" : "transparent",
                  color: "#fff", display: "inline-flex",
                  alignItems: "center", justifyContent: "center", fontSize: 13
                }}>
                  {done ? "✓" : ""}
                </span>
                <span style={{
                  fontSize: 14,
                  textDecoration: done ? "line-through" : "none",
                  color: done ? "#6E7570" : "#1F2723"
                }}>
                  {b.title}
                </span>
              </div>
            );
          })}
        </div>

        {progress && (
          <div className="fokus-card-gold" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#8A6F35", marginBottom: 4 }}>
              ✨ AI Suggestion
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#6E5A2E" }}>
              {progress.overallCompletionRate >= 50
                ? `Izvršenje ti je ${progress.overallCompletionRate}% — odličan tempo, nastavi!`
                : "Pokušaj odraditi barem jednu aktivnost ujutro — lakše je održati niz."}
            </p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}