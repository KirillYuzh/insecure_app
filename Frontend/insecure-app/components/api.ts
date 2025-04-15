import axios from "axios";

const API_URL = "http://localhost:8080/";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject(error.response.data.error || "Request failed");
    }
    return Promise.reject("Network error");
  }
);