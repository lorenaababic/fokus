import { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonToggle, IonDatetime, useIonToast
} from "@ionic/react";
import { useAuth } from "../context/AuthContext";
import {
  requestNotificationPermission, scheduleDailyReminder,
  cancelDailyReminder, isReminderScheduled
} from "../services/notifications";

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [presentToast] = useIonToast();

  useEffect(() => {
    isReminderScheduled().then(setReminderOn).catch(() => {});
  }, []);

  const handleToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          presentToast({ message: "Dozvola za notifikacije odbijena.", duration: 2500 });
          setReminderOn(false);
          return;
        }
        const [h, m] = reminderTime.split(":").map(Number);
        await scheduleDailyReminder(h, m);
        setReminderOn(true);
        presentToast({ message: `Podsjetnik postavljen za ${reminderTime} ⏰`, duration: 2000 });
      } else {
        await cancelDailyReminder();
        setReminderOn(false);
        presentToast({ message: "Podsjetnik isključen.", duration: 2000 });
      }
    } catch {
      presentToast({ message: "Notifikacije rade samo na mobilnom uređaju.", duration: 2500 });
      setReminderOn(false);
    }
  };

  const handleTimeChange = async (value: string) => {
    setReminderTime(value);
    if (reminderOn) {
      const [h, m] = value.split(":").map(Number);
      await scheduleDailyReminder(h, m);
      presentToast({ message: `Podsjetnik pomaknut na ${value} ⏰`, duration: 2000 });
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontWeight: 600 }}>Profil 👤</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="fokus-card-dark" style={{
          display: "flex", alignItems: "center", gap: 14
        }}>
          <span style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#D9B96E", color: "#1C3B34",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, flexShrink: 0
          }}>
            {user?.firstName?.[0] ?? "?"}
          </span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{user?.firstName}</div>
            <div className="muted" style={{ fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>

        <div className="fokus-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: 14.5 }}>Dnevni podsjetnik</strong>
              <div className="small">Notifikacija za dnevni check-in</div>
            </div>
            <IonToggle checked={reminderOn}
              onIonChange={(e) => handleToggle(e.detail.checked)} />
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="small" style={{ marginBottom: 4 }}>Vrijeme podsjetnika</div>
            <IonDatetime presentation="time"
              value={`2026-01-01T${reminderTime}:00`}
              onIonChange={(e) => {
                const v = e.detail.value;
                if (typeof v === "string") handleTimeChange(v.slice(11, 16));
              }}
              style={{ borderRadius: 12 }}
            />
          </div>
        </div>

        <div className="fokus-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#244A42" }}>🌿 FOKUS</div>
          <div className="small">Plan. Track. Become. · Verzija 1.0</div>
        </div>

        <div style={{ padding: "0 16px 24px" }}>
          <IonButton expand="block" fill="outline" color="medium" onClick={handleLogout}>
            Odjava
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}