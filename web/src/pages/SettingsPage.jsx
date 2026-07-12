import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 540 }}>
      <h1>Postavke ⚙️</h1>
      <p className="muted" style={{ margin: "4px 0 20px" }}>
        Upravljaj svojim računom i aplikacijom.
      </p>

      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Profil</h3>
        <label className="label">Ime</label>
        <input className="input" value={user?.firstName ?? ""} disabled />
        <label className="label">Email</label>
        <input className="input" value={user?.email ?? ""} disabled />
        <p className="small">Uređivanje profila bit će dostupno uskoro.</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>O aplikaciji</h3>
        <p className="muted" style={{ margin: 0 }}>
          FOKUS — aplikacija za strukturirano planiranje osobnih ciljeva,
          praćenje ponašanja i simulaciju budućih životnih scenarija.
        </p>
        <p className="small" style={{ marginTop: 8 }}>Verzija 1.0 · Završni rad</p>
      </div>
    </div>
  );
}