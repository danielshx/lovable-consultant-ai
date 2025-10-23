import { Navigate } from "react-router-dom";
import { mockAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!mockAuth.isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
