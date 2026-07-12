import client from "./client";

export const getVisionBoard = (scenarioId) =>
  client.get(`/visionboard?scenarioId=${scenarioId}`);

export const addVisionBoardItem = (scenarioId, image, caption, goalId) => {
  const formData = new FormData();
  formData.append("scenarioId", scenarioId);
  formData.append("image", image);
  if (caption) formData.append("caption", caption);
  if (goalId) formData.append("goalId", goalId);
  return client.post("/visionboard", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteVisionBoardItem = (id) => client.delete(`/visionboard/${id}`);