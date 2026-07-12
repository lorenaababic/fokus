import { useEffect, useState } from "react";
import { getVisionBoard, addVisionBoardItem, deleteVisionBoardItem } from "../api/visionboard";
import { generateAiVisionImage } from "../api/ai";

const BACKEND_URL = "http://localhost:8080";

export default function VisionBoardTab({ scenarioId, goals }) {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [goalId, setGoalId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = () => {
    getVisionBoard(scenarioId).then(({ data }) => setItems(data));
  };

  useEffect(load, [scenarioId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await addVisionBoardItem(scenarioId, file, caption, goalId || null);
      setFile(null); setCaption(""); setGoalId("");
      e.target.reset?.();
      load();
    } finally {
      setUploading(false);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      await generateAiVisionImage(scenarioId, aiPrompt, goalId || null);
      setAiPrompt("");
      load();
    } catch {
      alert("Generiranje slike nije uspjelo.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Ukloniti ovu sliku s ploče?")) return;
    await deleteVisionBoardItem(itemId);
    load();
  };

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 14 }}>
        <div>
          <h2>Vision board 🎨</h2>
          <p className="muted" style={{ margin: "2px 0 0" }}>Vizualiziraj svoje ciljeve i snove.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleUpload}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required
            style={{ fontSize: 13 }} />
          <input className="input" placeholder="Opis (opcionalno)" value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ flex: 1, minWidth: 140, marginBottom: 0 }} />
          <select className="select" value={goalId} onChange={(e) => setGoalId(e.target.value)}
            style={{ width: "auto", marginBottom: 0 }}>
            <option value="">— bez cilja —</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
            {uploading ? "Učitavanje..." : "+ Dodaj element"}
          </button>
        </form>

        <form onSubmit={handleAiGenerate}
          style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
          <input className="input" value={aiPrompt}
            placeholder="✨ Opiši sliku koju AI treba generirati (npr. 'trčanje uz more u zoru')"
            onChange={(e) => setAiPrompt(e.target.value)}
            style={{ flex: 1, marginBottom: 0 }} />
          <button type="submit" className="btn btn-gold btn-sm" disabled={generating}>
            {generating ? "Generiram..." : "✨ AI generiraj sliku"}
          </button>
        </form>
      </div>

      {items.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
          <div style={{ fontSize: 36 }}>🖼️</div>
          <p className="muted">Ploča je prazna. Dodaj prvu sliku!</p>
        </div>
      )}

      <div className="vision-grid">
        {items.map((item) => (
          <div key={item.id} className="vision-item">
            <img src={BACKEND_URL + item.imageUrl} alt={item.caption || "vision"} />
            {item.caption && <div className="vision-caption">{item.caption}</div>}
            <button className="btn btn-sm btn-danger"
              style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.9)" }}
              onClick={() => handleDelete(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}