import client from "./axiosClient";

export const getAddressesApi = () => client.get("/auth/addresses/");
export const createAddressApi = (data) =>
  client.post("/auth/addresses/", data);
