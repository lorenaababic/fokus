import client from "./client";

export const getScenarios = () => client.get("/scenarios");
export const getScenario = (id) => client.get(`/scenarios/${id}`);
export const createScenario = (data) => client.post("/scenarios", data);
export const updateScenario = (id, data) => client.put(`/scenarios/${id}`, data);
export const deleteScenario = (id) => client.delete(`/scenarios/${id}`);