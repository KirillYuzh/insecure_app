import axios from "axios";

const API_URL = "http://localhost:8081/";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Добавляем интерцептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject(error.response.data.error || "Request failed");
    }
    return Promise.reject("Network error");
  }
);

export const submit_flag = async (task_id: string, flag: string) => {
  const response = await api.post('tasks/flag/', { task_id, flag });
  return response.data;
}