import axios from "axios";

// export const CHAT_API_URL = "http://localhost:4000/api";
export const CHAT_API_URL = "https://api.ataloptical.org/api";

// export const SOCKET_URL = "http://localhost:4000";
export const SOCKET_URL = "https://api.ataloptical.org";

// export const IMAGE_URL = "https://api.ataloptical.org/uploads/";
export const IMAGE_URL = "http://localhost:4000/uploads/";

const API = axios.create({
  baseURL: CHAT_API_URL,
  withCredentials: true,
});

export default API;
