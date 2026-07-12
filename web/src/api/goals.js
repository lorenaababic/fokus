import client from "./client";

export const getGoalsByScenario = (scenarioId) =>
  client.get(`/goals?scenarioId=${scenarioId}`);
export const createGoal = (data) => client.post("/goals", data);
export const updateGoal = (id, data) => client.put(`/goals/${id}`, data);
export const deleteGoal = (id) => client.delete(`/goals/${id}`);

export const getBehaviorsByGoal = (goalId) =>
  client.get(`/behaviors?goalId=${goalId}`);
export const createBehavior = (data) => client.post("/behaviors", data);
export const updateBehavior = (id, data) => client.put(`/behaviors/${id}`, data);
export const deleteBehavior = (id) => client.delete(`/behaviors/${id}`);