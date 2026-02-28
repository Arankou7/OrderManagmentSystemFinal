import axios from 'axios';

// 1. Load Config
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const KEYCLOAK_TOKEN_URL = import.meta.env.VITE_KEYCLOAK_TOKEN_URL;
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

// Safety Check
if (!KEYCLOAK_TOKEN_URL || !CLIENT_ID) {
  console.error("🚨 Missing Keycloak Configuration in .env file!");
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// 🚦 CONCURRENCY LOCK (The Fix)
// ============================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// -----------------------------------------------------------------------------
// 📤 REQUEST INTERCEPTOR
// -----------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// 📥 RESPONSE INTERCEPTOR
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // IF 401 AND NOT RETRIED YET
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // 🛑 CASE A: Refresh is ALREADY happening. Wait for it.
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // 🟢 CASE B: We are the first one. Start Refresh.
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Access token expired. Refreshing...");
        const newAccessToken = await refreshAccessToken();
        
        // 1. Refresh successful! Process the queue.
        processQueue(null, newAccessToken);
        
        // 2. Retry our original failed request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // 3. Refresh failed completely. Kill the session.
        processQueue(refreshError, null);
        
        console.error("❌ Session expired or invalid. Logging out.");
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
        
      } finally {
        // 4. Always release the lock
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// 🔧 HELPER: Keycloak Refresh Call
// -----------------------------------------------------------------------------
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  // If we don't have a refresh token, we can't refresh.
  if (!refreshToken) {
    throw new Error("No refresh token in storage.");
  }

  try {
    const response = await axios.post(
      KEYCLOAK_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    // Keycloak rotates the refresh token, so update it if a new one comes back
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }

    return access_token;
  } catch (error) {
    // If Keycloak returns 400 (Invalid Grant), it means the refresh token is dead.
    throw error;
  }
};

export default api;