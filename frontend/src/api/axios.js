// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api', 
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add token to requests if it exists
// API.interceptors.request.use(
//   (config) => {
//     // Check both user token and psychiatrist token
//     const userToken = localStorage.getItem('token') || sessionStorage.getItem('token');
//     const psychiatristToken = localStorage.getItem('psychiatristToken') || sessionStorage.getItem('psychiatristToken');

//     // Prioritize psychiatrist token if route is for psychiatrist
//     if (config.url.startsWith('/psychiatrist') && psychiatristToken) {
//       config.headers.Authorization = `Bearer ${psychiatristToken}`;
//     } else if (userToken) {
//       config.headers.Authorization = `Bearer ${userToken}`;
//     }

//     console.log('API Request:', config.method.toUpperCase(), config.url); 
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default API;


import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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