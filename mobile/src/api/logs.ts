import client from "./client";

export const getAllMyBehaviors = () => client.get("/behaviors/mine");
export const getLogs = (behaviorId: number, from: string, to: string) =>
  client.get(`/logs?behaviorId=${behaviorId}&from=${from}&to=${to}`);
export const createLog = (data: {
  behaviorId: number;
  date: string;
  completed: boolean;
  note: string | null;
}) => client.post("/logs", data);
export const deleteLog = (id: number) => client.delete(`/logs/${id}`);