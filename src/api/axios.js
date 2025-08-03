import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7245/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
