import axios from "axios";

const API_URL = "http://localhost:8080/";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Включаем отправку кук
});

// Логин
export const login = async (username: string, password: string) => {
  try {
    await api.post(
      'login/',
      { username, password },
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Login failed", error);
  }
}

export const logout = async () => {
  try {
    await api.post('logout/', {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed", error);
  }
}

export const signup = async (username: string, email: string, name: string, password: string) => {
  try {
    await api.post(
      'signup/',
      { username, email, name, password },
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Signup failed", error);
    throw error;
  }
}