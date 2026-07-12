import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getScenarios } from "../api/scenarios";
import { getVisionBoard, addVisionBoardItem } from "../api/visionboard";
import { generateAiVisionImage } from "../api/ai";

const BACKEND_URL = "http://localhost:8080";

export default function VisionBoardOverviewPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // upload forma
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploadScenarioId, setUploadScenarioId] = useState("");
  const [uploading, setUploading] = useState(false);

  // AI forma
  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiScenarioId, setAiScenarioId] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = () => {
    getScenarios().then(async ({ data: scenarios }) => {
      const result = await Promise.all(
        scenarios.map(async (s) => {
          const { data: items } = await getVisionBoard(s.id);
          return { scenario: s, items };
        })
      );
      setCollections(result);
      setLoading(false);
      if (scenarios.length > 0) {
        setUploadScenarioId((prev) => prev || String(scenarios[0].id));
        setAiScenarioId((prev) => prev || String(scenarios[0].id));
      }
    });
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !uploadScenarioId) return;
    setUploading(true);
    try {
      await addVisionBoardItem(uploadScenarioId, file, caption, null);
      setFile(null);
      setCaption("");
      setShowUpload(false);
      e.target.reset?.();
      load();
    } finally {
      setUploading(false);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !aiScenarioId) return;
    setGenerating(true);
    try {
      await generateAiVisionImage(aiScenarioId, aiPrompt, null);
      setAiPrompt("");
      setShowAi(false);
      load();
    } catch {
      alert("Generiranje slike nije uspjelo.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <p className="muted">Učitavanje...</p>;

  return (
    <div>
      <div className="row-between" style={{ marginBottom: 4 }}>
        <h1>Vision board 🎨</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm"
            onClick={() => { setShowUpload(!showUpload); setShowAi(false); }}>
            + Dodaj element
          </button>
          <button className="btn btn-gold btn-sm"
            onClick={() => { setShowAi(!showAi); setShowUpload(false); }}>
            ✨ AI generiraj sliku
          </button>
        </div>
      </div>
      <p className="muted" style={{ margin: "0 0 20px" }}>
        Vizualiziraj svoje ciljeve i snove — po scenarijima.
      </p>

      {showUpload && (
        <form onSubmit={handleUpload} className="card"
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="file" accept="image/*" required
            onChange={(e) => setFile(e.target.files[0])} style={{ fontSize: 13 }} />
          <input className="input" placeholder="Opis (opcionalno)" value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ flex: 1, minWidth: 140, marginBottom: 0 }} />
          <select className="select" value={uploadScenarioId} required
            onChange={(e) => setUploadScenarioId(e.target.value)}
            style={{ width: "auto", marginBottom: 0 }}>
            {collections.map(({ scenario }) => (
              <option key={scenario.id} value={scenario.id}>{scenario.title}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm" disabled={uploading}>
            {uploading ? "Učitavanje..." : "Dodaj"}
          </button>
        </form>
      )}

      {showAi && (
        <form onSubmit={handleAiGenerate} className="card"
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input className="input" value={aiPrompt}
            placeholder="✨ Opiši sliku (npr. 'trčanje uz more u zoru')"
            onChange={(e) => setAiPrompt(e.target.value)}
            style={{ flex: 1, minWidth: 180, marginBottom: 0 }} />
          <select className="select" value={aiScenarioId} required
            onChange={(e) => setAiScenarioId(e.target.value)}
            style={{ width: "auto", marginBottom: 0 }}>
            {collections.map(({ scenario }) => (
              <option key={scenario.id} value={scenario.id}>{scenario.title}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-gold btn-sm" disabled={generating}>
            {generating ? "Generiram..." : "✨ Generiraj"}
          </button>
        </form>
      )}

      {collections.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
          <p className="muted">Još nemaš scenarija. Kreiraj prvi pa dodaj slike na njegovu ploču.</p>
        </div>
      )}

      <div className="vision-grid">
        {collections.map(({ scenario, items }) => {
          const cover = items[0];
          return (
            <div key={scenario.id} className="vision-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/scenarios/${scenario.id}?tab=visionboard`)}>
              {cover ? (
                <img src={BACKEND_URL + cover.imageUrl} alt={scenario.title} />
              ) : (
                <div style={{
                  height: 175, display: "flex", alignItems: "center",
                  justifyContent: "center", background: "var(--green-soft)",
                  fontSize: 34
                }}>
                  🖼️
                </div>
              )}
              <div className="vision-caption">
                {scenario.title}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
                  {items.length} {items.length === 1 ? "slika" : "slika/e"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}