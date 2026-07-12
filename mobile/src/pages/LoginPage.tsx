import { useState } from "react";
import {
  IonPage, IonContent, IonInput, IonButton, IonText, IonItem
} from "@ionic/react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    try {
      await login(email, password);
      window.location.href = "/home";
    } catch {
      setError("Neispravan email ili lozinka.");
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ marginTop: "22vh" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{
              width: 56, height: 56, borderRadius: 16, background: "#244A42",
              color: "#D9B96E", display: "inline-flex", alignItems: "center",
              justifyContent: "center", fontSize: 28
            }}>🌿</span>
            <h1 style={{ margin: "12px 0 2px", fontWeight: 600 }}>FOKUS</h1>
            <p className="muted" style={{ margin: 0 }}>Plan. Track. Become.</p>
          </div>

          <div className="fokus-card" style={{ margin: 0 }}>
            <IonItem lines="none" style={{
              "--background": "#F7F5F2", borderRadius: 12, marginBottom: 10
            }}>
              <IonInput type="email" placeholder="Email" value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? "")} />
            </IonItem>
            <IonItem lines="none" style={{
              "--background": "#F7F5F2", borderRadius: 12, marginBottom: 4
            }}>
              <IonInput type="password" placeholder="Lozinka" value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? "")} />
            </IonItem>

            {error && (
              <IonText color="danger">
                <p style={{ fontSize: 13, margin: "8px 4px 0" }}>{error}</p>
              </IonText>
            )}

            <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>
              Prijavi se
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}