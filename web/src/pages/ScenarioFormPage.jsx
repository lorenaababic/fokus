import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getScenario, createScenario, updateScenario } from "../api/scenarios";

export default function ScenarioFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    timeFrame: "THREE_MONTHS",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      getScenario(id).then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description ?? "",
          timeFrame: data.timeFrame,
          startDate: data.startDate,
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await updateScenario(id, form);
      } else {
        await createScenario(form);
      }
      navigate("/");
    } catch {
      setError("Greška pri spremanju. Provjeri podatke.");
    }
  };

  return (
    <div style={{ maxWidth: 540 }}>
      <Link to="/" className="small">← Natrag na scenarije</Link>
      <h1 style={{ margin: "10px 0 4px" }}>
        {isEdit ? "Uredi scenarij" : "Novi scenarij"}
      </h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Opiši kako izgleda tvoj život na kraju ovog razdoblja.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label className="label">Naziv</label>
          <input name="title" className="input" placeholder="npr. Zdraviji život"
            value={form.title} onChange={handleChange} required />

          <label className="label">Opis</label>
          <textarea name="description" className="textarea" rows={4}
            placeholder="Kako izgleda tvoj život na kraju ovog scenarija?"
            value={form.description} onChange={handleChange} />

          <label className="label">Vremenski okvir</label>
          <select name="timeFrame" className="select" value={form.timeFrame} onChange={handleChange}>
            <option value="THREE_MONTHS">3 mjeseca</option>
            <option value="SIX_MONTHS">6 mjeseci</option>
            <option value="ONE_YEAR">1 godina</option>
          </select>

          <label className="label">Datum početka</label>
          <input name="startDate" type="date" className="input"
            value={form.startDate} onChange={handleChange} required />

          {error && <p className="error-text">{error}</p>}

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Spremi promjene" : "Kreiraj scenarij"}
            </button>
            <button type="button" className="btn" onClick={() => navigate("/")}>
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}