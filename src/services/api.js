import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7107/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Gắn access token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Cờ để tránh gọi refresh token nhiều lần đồng thời
let isRefreshing = false;
let refreshSubscribers = [];

// Gọi lại các request đang chờ sau khi refresh thành công
function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

// Đăng ký các request chờ token mới
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

// Xử lý lỗi (401) và tự động refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa từng thử refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post("https://localhost:7101/api/auth/refresh-token", {
          //userId: localStorage.getItem("userId"),
          refreshToken: localStorage.getItem("refreshToken"),
        });

        const { accessToken, refreshToken } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Gọi lại các request đang đợi
        onRefreshed(accessToken);
        isRefreshing = false;

        // Gửi lại request cũ
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        //localStorage.removeItem("userId");
        window.location.href = "/login"; // chuyển hướng nếu refresh thất bại
        return Promise.reject(err);
      }
    }

    // Các lỗi khác
    return Promise.reject(error);
  }
);

export default api;
