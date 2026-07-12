import { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonRefresher, IonRefresherContent
} from "@ionic/react";
import { getScenarios } from "../api/scenarios";
import { getScenarioProgress } from "../api/analytics";

function ProgressRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = pct >= 70 ? "#244A42" : pct >= 40 ? "#D9B96E" : "#C9CFC9";
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#EDEBE5" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, pct) / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        fontSize={13} fontWeight={600} fill="#1F2723">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

const TIME_FRAME_LABELS: Record<string, string> = {
  THREE_MONTHS: "3 mjeseca",
  SIX_MONTHS: "6 mjeseci",
  ONE_YEAR: "1 godina",
};

export default function ScenariosTab() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, any>>({});

  const load = async () => {
    const { data } = await getScenarios();
    setScenarios(data);
    const map: Record<number, any> = {};
    await Promise.all(
      data.map(async (s: any) => {
        try {
          const { data: p } = await getScenarioProgress(s.id);
          map[s.id] = p;
        } catch { }
      })
    );
    setProgressMap(map);
  };

  useEffect(() => { load(); }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("hr-HR", { month: "short", year: "numeric" });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{
          "--background": "#244A42",
          "--color": "#F7F5F2"
        }}>
          <IonTitle style={{ fontWeight: 600 }}>Ciljevi</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ "--background": "#244A42" }}>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <p style={{ margin: "10px 16px 14px", fontSize: 13, color: "#B9C4BF" }}>
          Tvoji životni scenariji i njihov napredak.
        </p>

        {scenarios.length === 0 && (
          <div className="fokus-card" style={{
            textAlign: "center", padding: "36px 18px",
            background: "#FAF8F4", border: "none"
          }}>
            <div style={{ fontSize: 36 }}>🌱</div>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Još nemaš scenarija — kreiraj ih kroz web aplikaciju.
            </p>
          </div>
        )}

        {scenarios.map((s) => {
          const p = progressMap[s.id];
          const goals = p?.goals ?? [];
          return (
            <div key={s.id} className="fokus-card" style={{
              paddingBottom: 8,
              background: "#FAF8F4",
              border: "none"
            }}>

              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 16 }}>{s.title}</strong>
                  <div className="small">
                    Target: {fmt(s.targetDate)} · {TIME_FRAME_LABELS[s.timeFrame]}
                  </div>
                </div>
                <ProgressRing pct={p?.overallCompletionRate ?? 0} size={62} />
              </div>

              {goals.map((g: any, i: number) => (
                <div key={g.goalId} style={{ display: "flex", gap: 14 }}>
                  {/* Timeline linija + točka */}
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", width: 16
                  }}>
                    <span style={{
                      width: 11, height: 11, borderRadius: "50%",
                      border: `2.5px solid ${g.completionRate >= 100 ? "#244A42" : "#D9B96E"}`,
                      background: g.completionRate >= 100 ? "#244A42" : "transparent",
                      flexShrink: 0, marginTop: 6
                    }} />
                    {i < goals.length - 1 && (
                      <span style={{ width: 2, flex: 1, background: "#EDEBE5" }} />
                    )}
                  </div>
                  {/* Sadržaj cilja */}
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: i < goals.length - 1 ? 18 : 10
                  }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 500 }}>{g.goalTitle}</div>
                      <div className="small">
                        {g.behaviors.length} {g.behaviors.length === 1 ? "ponašanje" : "ponašanja"}
                      </div>
                    </div>
                    <ProgressRing pct={g.completionRate} size={48} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ height: 20 }} />
      </IonContent>
    </IonPage>
  );
}