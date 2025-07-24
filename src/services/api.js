// import axios from "axios";

// const api = axios.create({
//   //baseURL: "https://localhost:7198/api",
//   //baseURL: "https://localhost:7107/api",
//   //baseURL: "http://localhost:5226/api",
//   //baseURL: "http://localhost:5000/api",
//   baseURL: process.env.REACT_APP_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: false,
// });

// // Gắn access token vào mỗi request
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Cờ để tránh gọi refresh token nhiều lần đồng thời
// let isRefreshing = false;
// let refreshSubscribers = [];

// // Gọi lại các request đang chờ sau khi refresh thành công
// function onRefreshed(newAccessToken) {
//   refreshSubscribers.forEach((callback) => callback(newAccessToken));
//   refreshSubscribers = [];
// }

// // Đăng ký các request chờ token mới
// function addRefreshSubscriber(callback) {
//   refreshSubscribers.push(callback);
// }

// // Xử lý lỗi (401) và tự động refresh token
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Nếu lỗi 401 và chưa từng thử refresh
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       localStorage.getItem("refreshToken")
//     ) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         return new Promise((resolve) => {
//           addRefreshSubscriber((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             resolve(api(originalRequest));
//           });
//         });
//       }

//       isRefreshing = true;

//       try {
//         // const res = await axios.post("http://localhost:5041/api/auth/refresh-token", {
//         //   //userId: localStorage.getItem("userId"),
//         //   refreshToken: localStorage.getItem("refreshToken"),
//         // });

//         const res = await api.post("/auth/refresh-token", {
//           refreshToken: localStorage.getItem("refreshToken"),
//         });

//         const { accessToken, refreshToken } = res.data;

//         localStorage.setItem("accessToken", accessToken);
//         localStorage.setItem("refreshToken", refreshToken);

//         // Gọi lại các request đang đợi
//         onRefreshed(accessToken);
//         isRefreshing = false;

//         // Gửi lại request cũ
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (err) {
//         isRefreshing = false;
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         //localStorage.removeItem("userId");
//         window.location.href = "/login"; // chuyển hướng nếu refresh thất bại
//         return Promise.reject(err);
//       }
//     }

//     // Các lỗi khác
//     return Promise.reject(error);
//   }
// );

// export default api;








import axios from "axios";

// Sử dụng biến môi trường cho baseURL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ví dụ: "http://localhost:5041/api"
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

    // Nếu lỗi 401 (Unauthorized), chưa retry và có refreshToken được lưu
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;

      // Nếu đang trong quá trình refresh, đăng ký request chờ
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
        // Dùng api.post để đảm bảo dùng cùng baseURL và cấu hình (nếu cần, có thể tạo instance mới để bỏ qua interceptor)
        const res = await api.post("/auth/refresh-token", {
          refreshToken: localStorage.getItem("refreshToken"),
        });

        const { accessToken, refreshToken } = res.data;

        // Cập nhật token mới trong localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Gọi lại các request đang chờ
        onRefreshed(accessToken);
        isRefreshing = false;

        // Gửi lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Nếu refresh thất bại, chuyển hướng về trang login
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // Các lỗi khác
    return Promise.reject(error);
  }
);

export default api;
