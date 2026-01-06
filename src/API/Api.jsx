import axios from "axios";

// LOCAL
// export const CHAT_API_URL = "http://localhost:4000/api";
// export const SOCKET_URL = "http://localhost:4000";
// export const IMAGE_URL = "http://localhost:4000/uploads/";

// LIVE 
export const CHAT_API_URL = "https://api.ataloptical.org/api";
export const SOCKET_URL = "https://api.ataloptical.org";
export const IMAGE_URL = "https://api.ataloptical.org/uploads/";


const API = axios.create({
  baseURL: CHAT_API_URL,
  withCredentials: true,
});

export default API;
