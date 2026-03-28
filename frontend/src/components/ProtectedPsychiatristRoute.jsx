import { Navigate } from "react-router-dom";

export default function ProtectedPsychiatristRoute({ children }) {
  const psychiatristToken = localStorage.getItem("psychiatristToken") || sessionStorage.getItem("psychiatristToken");

  if (!psychiatristToken) {
    return <Navigate to="/psychiatrist/login" replace />;
  }

  return children;
}