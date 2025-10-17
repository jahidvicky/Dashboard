import axios from "axios";

const API = axios.create({
  // baseURL: "https://atal-back-updated.onrender.com/api",
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
})

export default API;
export const IMAGE_URL = "http://localhost:4000/uploads/"
// export const IMAGE_URL = "https://atal-back-updated.onrender.com/uploads/";