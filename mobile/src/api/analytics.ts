import client from "./client";

export const getScenarioProgress = (scenarioId: string | number) =>
  client.get(`/analytics/scenarios/${scenarioId}/progress`);