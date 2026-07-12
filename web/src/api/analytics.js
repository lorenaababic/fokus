import client from "./client";

export const getScenarioProgress = (scenarioId) =>
  client.get(`/analytics/scenarios/${scenarioId}/progress`);

export const getBehaviorTimeline = (behaviorId, from, to) =>
  client.get(`/analytics/behaviors/${behaviorId}/timeline?from=${from}&to=${to}`);