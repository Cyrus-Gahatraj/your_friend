import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Auth";

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();

  if (!auth.access) {
    return <Navigate to="/" />;
  }

  return children;
}
