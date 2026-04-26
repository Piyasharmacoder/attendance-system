import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, userInfo } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}