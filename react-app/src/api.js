import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
});

let csrfReady = false;
const ensureCsrf = async () => {
  if (csrfReady) return;
  await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
  csrfReady = true;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response && response.status === 419 && !config._retried) {
      config._retried = true;
      csrfReady = false;
      try {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        csrfReady = true;
        return api(config);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
