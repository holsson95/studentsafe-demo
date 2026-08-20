// Axios instance
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// A missing/expired/invalid token means the local session is stale - clear it and
// send the user back to login rather than leaving them on a dashboard with no data.
// Deliberately does NOT trigger on a 403 from authorizeAdmin ("Admin only"), since
// that's a valid, logged-in user who just lacks permission for that one resource.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error;
        if (error.response?.status === 401 || message === 'Invalid token') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
