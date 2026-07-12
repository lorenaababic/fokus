import { useEffect, useState, useCallback } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonCheckbox, IonLabel, IonNote, IonDatetime,
  IonRefresher, IonRefresherContent, IonProgressBar
} from "@ionic/react";
import { getAllMyBehaviors, getLogs, createLog, deleteLog } from "../api/logs";

interface Behavior {
  id: number;
  title: string;
  frequency: "DAILY" | "WEEKLY";
  targetCount: number;
}

interface Log {
  id: number;
  behaviorId: number;
  completed: boolean;
  note: string | null;
}

const FREQUENCY_LABELS = { DAILY: "dnevno", WEEKLY: "tjedno" };

export default function CheckInTab() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [logs, setLogs] = useState<Record<number, Log>>({});

  const load = useCallback(async (selectedDate: string) => {
    const { data: behaviorList } = await getAllMyBehaviors();
    setBehaviors(behaviorList);

    const logMap: Record<number, Log> = {};
    await Promise.all(
      behaviorList.map(async (b: Behavior) => {
        const { data } = await getLogs(b.id, selectedDate, selectedDate);
        if (data.length > 0) logMap[b.id] = data[0];
      })
    );
    setLogs(logMap);
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  const toggle = async (behavior: Behavior) => {
    const existing = logs[behavior.id];
    if (existing) {
      await deleteLog(existing.id);
    } else {
      await createLog({ behaviorId: behavior.id, date, completed: true, note: null });
    }
    load(date);
  };

  const doneCount = Object.keys(logs).length;
  const progress = behaviors.length > 0 ? doneCount / behaviors.length : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dnevni check-in ✅</IonTitle>
        </IonToolbar>
        {behaviors.length > 0 && <IonProgressBar value={progress} />}
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => {
          await load(date);
          e.detail.complete();
        }}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding-horizontal">
          <IonDatetime
            presentation="date"
            value={date}
            onIonChange={(e) => {
              const v = e.detail.value;
              if (typeof v === "string") setDate(v.slice(0, 10));
            }}
            style={{ margin: "0 auto" }}
          />
          {behaviors.length > 0 && (
            <p className="ion-text-center">
              Odrađeno <strong>{doneCount}</strong> od <strong>{behaviors.length}</strong>
            </p>
          )}
        </div>

        <IonList>
          {behaviors.map((b) => (
            <IonItem key={b.id}>
              <IonCheckbox
                slot="start"
                checked={Boolean(logs[b.id])}
                onIonChange={() => toggle(b)}
              />
              <IonLabel>
                <h2 style={{
                  textDecoration: logs[b.id] ? "line-through" : "none"
                }}>{b.title}</h2>
                <IonNote>{b.targetCount}x {FREQUENCY_LABELS[b.frequency]}</IonNote>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {behaviors.length === 0 && (
          <p className="ion-padding ion-text-center">
            Nemaš još ponašanja — dodaj ih kroz web aplikaciju. 🎯
          </p>
        )}
      </IonContent>
    </IonPage>
  );
}