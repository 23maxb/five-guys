// // src/auth/ProtectedRoute.tsx
// import React from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// export default function ProtectedRoute() {
//   const { authed } = useAuth();        
//   const location = useLocation();

//   return authed
//     ? <Outlet />
//     : <Navigate to="/login" replace state={{ from: location }} />;
// }
