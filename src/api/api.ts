import axios from 'axios'


const api = axios.create({
  baseURL: 'http://10.49.92.106:4000/api/v1/minta-fresh',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
