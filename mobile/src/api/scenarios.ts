import client from "./client";

export const getScenarios = () => client.get("/scenarios");
export const getScenario = (id: string | number) => client.get(`/scenarios/${id}`);
export const getVisionBoard = (scenarioId: string | number) =>
  client.get(`/visionboard?scenarioId=${scenarioId}`);