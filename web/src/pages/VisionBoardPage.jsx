import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVisionBoard, addVisionBoardItem, deleteVisionBoardItem } from "../api/visionboard";
import { getGoalsByScenario } from "../api/goals";
import { generateAiVisionImage } from "../api/ai";

const BACKEND_URL = "http://localhost:8080";

export default function VisionBoardPage() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [goalId, setGoalId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const load = () => {
    getVisionBoard(id).then(({ data }) => setItems(data));
  };

  useEffect(() => {
    load();
    getGoalsByScenario(id).then(({ data }) => setGoals(data));
  }, [id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      await addVisionBoardItem(id, file, caption, goalId || null);
      setFile(null);
      setCaption("");
      setGoalId("");
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
    await generateAiVisionImage(id, aiPrompt, goalId || null);
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
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <Link to={`/scenarios/${id}`}>← Natrag na scenarij</Link>
      <h1>Vision board 🎨</h1>
      <p style={{ color: "#666" }}>
        Vizualiziraj svoje ciljeve — dodaj slike koje predstavljaju život kakav gradiš.
      </p>

      <form onSubmit={handleUpload} style={{
        border: "1px dashed #aaa", borderRadius: 8, padding: 16, marginBottom: 24,
        display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center"
      }}>
        <input type="file" accept="image/*"
          onChange={(e) => setFile(e.target.files[0])} required />
        <input placeholder="Opis (opcionalno)" value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ padding: 8, flex: 1, minWidth: 150 }} />
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)} style={{ padding: 8 }}>
          <option value="">— bez cilja —</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
        <button type="submit" disabled={uploading} style={{ padding: "8px 16px" }}>
          {uploading ? "Učitavanje..." : "Dodaj sliku"}
        </button>
      </form>

      <form onSubmit={handleAiGenerate} style={{
        border: "1px dashed #b39ddb", borderRadius: 8, padding: 16, marginBottom: 24,
        display: "flex", gap: 8, alignItems: "center"
      }}>
        <input placeholder="✨ Opiši sliku koju AI treba generirati (npr. 'trčanje uz more u zoru')"
          value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
          style={{ padding: 8, flex: 1 }} />
        <button type="submit" disabled={generating} style={{ padding: "8px 16px" }}>
          {generating ? "Generiram... (~15s)" : "✨ Generiraj"}
        </button>
      </form>

      {items.length === 0 && <p>Ploča je prazna. Dodaj prvu sliku! ✨</p>}

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16
      }}>
        {items.map((item) => {
          const linkedGoal = goals.find((g) => g.id === item.goalId);
          return (
            <div key={item.id} style={{
              borderRadius: 12, overflow: "hidden", border: "1px solid #ddd",
              position: "relative"
            }}>
              <img src={BACKEND_URL + item.imageUrl} alt={item.caption || "vision"}
                style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
              <div style={{ padding: 10 }}>
                {item.caption && <div>{item.caption}</div>}
                {linkedGoal && (
                  <div style={{ fontSize: 13, color: "#7c7cf0" }}>🎯 {linkedGoal.title}</div>
                )}
                <button onClick={() => handleDelete(item.id)}
                  style={{ fontSize: 12, marginTop: 6 }}>
                  Ukloni
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}