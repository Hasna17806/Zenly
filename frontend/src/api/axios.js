import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://zenly.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const userToken =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    const psychiatristToken =
      localStorage.getItem('psychiatristToken') || sessionStorage.getItem('psychiatristToken');

    if (config.url?.startsWith('/psychiatrist') && psychiatristToken) {
      config.headers.Authorization = `Bearer ${psychiatristToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;