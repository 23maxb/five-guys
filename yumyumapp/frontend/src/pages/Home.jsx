import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1> This is the Home Page</h1>
      <nav>
        <Link to="/calender">Calender</Link> |{" "}
        <Link to="/fridge">Fridge</Link> |{" "}
        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
}
