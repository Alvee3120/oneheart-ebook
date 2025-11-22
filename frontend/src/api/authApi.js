import client from "./axiosClient";

export const loginApi = (username, password) =>
  client.post("/auth/login/", { username, password });

export const registerApi = (data) => client.post("/auth/register/", data);

export const meApi = () => client.get("/auth/me/");
