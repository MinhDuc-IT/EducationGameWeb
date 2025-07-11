// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
