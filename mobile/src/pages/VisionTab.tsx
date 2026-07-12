import { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonModal, IonButton, IonRefresher, IonRefresherContent
} from "@ionic/react";
import { getScenarios, getVisionBoard } from "../api/scenarios";

const BACKEND_URL = "http://10.0.2.2:8080";

interface VisionItem {
  id: number;
  imageUrl: string;
  caption: string | null;
  scenarioTitle: string;
  goalTitle: string | null;
}

export default function VisionTab() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [selected, setSelected] = useState<VisionItem | null>(null);

  const load = async () => {
    const { data: scenarios } = await getScenarios();
    const all: VisionItem[] = [];
    await Promise.all(
      scenarios.map(async (s: any) => {
        const { data: boardItems } = await getVisionBoard(s.id);
        const { data: progress } = { data: null }; // ne treba
        boardItems.forEach((item: any) => {
          all.push({
            id: item.id,
            imageUrl: item.imageUrl,
            caption: item.caption,
            scenarioTitle: s.title,
            goalTitle: null,
          });
        });
      })
    );
    setItems(all);
  };

  useEffect(() => { load(); }, []);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontWeight: 600 }}>Vision Board</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {items.length === 0 && (
          <div className="fokus-card" style={{ textAlign: "center", padding: "36px 18px" }}>
            <div style={{ fontSize: 36 }}>🖼️</div>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              Ploča je prazna — dodaj slike kroz web aplikaciju.
            </p>
          </div>
        )}

        {/* Masonry grid u 2 kolone */}
        <div style={{ columnCount: 2, columnGap: 10, padding: "4px 16px 24px" }}>
          {items.map((item, i) => (
            <div key={item.id} onClick={() => setSelected(item)} style={{
              breakInside: "avoid", marginBottom: 10,
              borderRadius: 18, overflow: "hidden", position: "relative",
              cursor: "pointer"
            }}>
              <img src={BACKEND_URL + item.imageUrl} alt={item.caption ?? "vision"}
                style={{
                  width: "100%", display: "block",
                  height: i % 3 === 0 ? 210 : 150, objectFit: "cover"
                }} />
              {item.caption && (
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  padding: "20px 10px 8px", color: "#fff",
                  fontSize: 12, fontWeight: 500,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.65))"
                }}>
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detalj — modal */}
        <IonModal isOpen={!!selected} onDidDismiss={() => setSelected(null)}>
          {selected && (
            <IonContent>
              <img src={BACKEND_URL + selected.imageUrl} alt={selected.caption ?? "vision"}
                style={{ width: "100%", height: "55vh", objectFit: "cover", display: "block" }} />
              <div style={{ padding: 20 }}>
                {selected.caption && (
                  <h2 style={{ margin: "0 0 4px", fontWeight: 600 }}>{selected.caption}</h2>
                )}
                <p className="muted" style={{ margin: 0 }}>
                  🎯 Scenarij: {selected.scenarioTitle}
                </p>
                <IonButton expand="block" fill="outline" color="medium"
                  className="ion-margin-top" onClick={() => setSelected(null)}>
                  Zatvori
                </IonButton>
              </div>
            </IonContent>
          )}
        </IonModal>
      </IonContent>
    </IonPage>
  );
}