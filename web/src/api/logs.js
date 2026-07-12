import client from "./client";

export const getAllMyBehaviors = () => client.get("/behaviors/mine");
export const getLogs = (behaviorId, from, to) =>
  client.get(`/logs?behaviorId=${behaviorId}&from=${from}&to=${to}`);
export const createLog = (data) => client.post("/logs", data);
export const updateLog = (id, data) => client.put(`/logs/${id}`, data);
export const deleteLog = (id) => client.delete(`/logs/${id}`);