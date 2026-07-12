import client from "./client";

export const getAiBehaviorSuggestions = (goalId) =>
  client.post(`/ai/behavior-suggestions/${goalId}`);

export const generateAiVisionImage = (scenarioId, prompt, goalId) =>
  client.post("/ai/vision-image", { scenarioId, prompt, goalId: goalId || null });