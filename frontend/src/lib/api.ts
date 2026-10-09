import axios from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  withCredentials: true, // needed so the browser stores/sends the httpOnly refresh cookie
});

// Shared promise so only ONE refresh runs at a time
let refreshPromise: Promise<string> | null = null;

function clearSession() {
  Cookies.remove("access_token");
  window.location.href = "/";
}

async function refreshAccessToken(): Promise<string> {
  // Plain axios so this call skips our interceptors.
  // The browser sends the httpOnly refresh cookie automatically.
  const res = await axios.post(`${baseURL}/auth/refresh`, null, {
    withCredentials: true,
  });

  const { access_token } = res.data;
  Cookies.set("access_token", access_token, { expires: 15 });
  return access_token;
}

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url ?? "";

    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Log out only if the server rejected the refresh token.
        // A network error or 5xx should not kick the user out.
        if (refreshError?.response?.status === 401) {
          clearSession();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;