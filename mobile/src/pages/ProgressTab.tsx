import { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSelect, IonSelectOption
} from "@ionic/react";
import { getScenarios } from "../api/scenarios";
import { getScenarioProgress } from "../api/analytics";

export default function ProgressTab() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    getScenarios().then(({ data }) => {
      setScenarios(data);
      if (data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    getScenarioProgress(selectedId).then(({ data }) => setProgress(data));
  }, [selectedId]);

  const allBehaviors = progress
    ? progress.goals.flatMap((g: any) =>
        g.behaviors.map((b: any) => ({ ...b, goalTitle: g.goalTitle })))
    : [];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontWeight: 600 }}>Napredak 📊</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="fokus-card" style={{ paddingTop: 8, paddingBottom: 8 }}>
          <IonSelect label="Scenarij" value={selectedId} interface="popover"
            onIonChange={(e) => setSelectedId(e.detail.value)}>
            {scenarios.map((s) => (
              <IonSelectOption key={s.id} value={s.id}>{s.title}</IonSelectOption>
            ))}
          </IonSelect>
        </div>

        {progress && (
          <>
            <div className="fokus-card-dark" style={{ textAlign: "center", padding: "26px 20px" }}>
              <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {progress.overallCompletionRate}%
              </div>
              <div className="muted" style={{ fontSize: 13 }}>ukupno izvršenje scenarija</div>
              <div className="progress-track" style={{ marginTop: 14 }}>
                <div className="progress-fill"
                  style={{ width: `${progress.overallCompletionRate}%` }} />
              </div>
            </div>

            <div className="fokus-card">
              <p className="small" style={{ margin: "0 0 12px", fontWeight: 600 }}>
                PO PONAŠANJIMA
              </p>
              {allBehaviors.map((b: any) => (
                <div key={b.behaviorId} style={{ marginBottom: 14 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "baseline", marginBottom: 4
                  }}>
                    <span style={{ fontSize: 14 }}>{b.behaviorTitle}</span>
                    <span style={{
                      fontSize: 12.5, fontWeight: 600,
                      color: b.deviation >= 0 ? "#4CAF7D" : "#D95D5D"
                    }}>
                      {b.actualCount}/{b.expectedCount} · {b.deviation > 0 ? "+" : ""}{b.deviation}%
                    </span>
                  </div>
                  <div className="progress-track" style={{ marginTop: 0 }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${Math.min(100, b.completionRate)}%`,
                      background: b.completionRate >= 70 ? "#244A42"
                        : b.completionRate >= 40 ? "#D9B96E" : "#D95D5D"
                    }} />
                  </div>
                  <div className="small" style={{ marginTop: 2 }}>{b.goalTitle}</div>
                </div>
              ))}
              {allBehaviors.length === 0 && (
                <p className="muted" style={{ margin: 0 }}>Nema podataka za prikaz.</p>
              )}
            </div>
            <div style={{ height: 20 }} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
}