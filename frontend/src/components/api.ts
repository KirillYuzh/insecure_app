import axios from "axios";

const API_URL = "http://localhost:8080/";

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

export const login = async (email: string, password: string) => {
  const response = await api.post('login', { email, password });
  return response.data;
}

export const logout = async () => {
  await api.post('logout');
}

export const signup = async (username: string, email: string, name: string, password: string) => {
  const response = await api.post('signup', { username, email, name, password });
  return response.data;
}

export const submit_flag = async (task_id: string, flag: string) => {
  const response = await api.post('tasks/flag/', { task_id, flag });
  return response.data;
}