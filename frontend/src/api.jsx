import axios from "axios";

console.log("API Configuration:");
console.log("- Base URL: http://localhost:8000");

const api = axios.create({
  baseURL: "http://localhost:8000",
});

console.log("API instance created with baseURL:", api.defaults.baseURL);

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    console.log("API Request interceptor - token from localStorage:", token);
    console.log("API Request interceptor - config:", config);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "API Request interceptor - Authorization header set:",
        config.headers.Authorization,
      );
    } else {
      console.log("API Request interceptor - No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("API Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log("API Response interceptor - successful response:", response);
    return response;
  },
  async (error) => {
    console.error("API Response interceptor - error:", error);
    console.error("API Response interceptor - error response:", error.response);
    console.error(
      "API Response interceptor - error status:",
      error.response?.status,
    );
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      console.log(
        "API Response interceptor - 401 error, attempting token refresh",
      );
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        console.log("API Response interceptor - refresh token:", refreshToken);
        if (refreshToken) {
          const response = await axios.post(
            "http://localhost:8000/auth/refresh",
            {
              refresh_token: refreshToken,
            },
          );

          const { access_token } = response.data;
          console.log(
            "API Response interceptor - new access token received:",
            access_token,
          );
          localStorage.setItem("access_token", access_token);

          return api(original);
        }
      } catch (refreshError) {
        console.error(
          "API Response interceptor - refresh error:",
          refreshError,
        );
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
