import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Let the browser set multipart boundary for FormData (JSON content-type breaks uploads/updates)
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
  return config;
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
    
    // Globally replace the generic "Server Error" message from Laravel
    if (response && response.data && response.data.message === 'Server Error') {
      response.data.message = 'An unexpected error occurred. Please try again or contact admin.';
    }

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
