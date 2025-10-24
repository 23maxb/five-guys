// src/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authed, loading } = useAuth();        
  const location = useLocation();

  // Show loading while checking authentication status
  if (loading) {
    return <div>Loading...</div>;
  }

  return authed
    ? <>{children}</>
    : <Navigate to="/login" replace state={{ from: location }} />;
}
