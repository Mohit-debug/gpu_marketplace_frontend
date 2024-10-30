import axios from "axios";

const api = axios.create({
  baseURL: 'https://gpu-marketplace-server-mohits-projects-032640aa.vercel.app/',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
