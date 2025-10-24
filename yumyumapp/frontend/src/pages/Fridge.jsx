import React from "react";
import { Link } from "react-router-dom";

export default function Fridge() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Fridge Page</h1>
      <nav>
        <Link to="/home">Home</Link> |{" "}
        <Link to="/calender">Calendar</Link>
      </nav>
      <p>Fridge functionality will be implemented here.</p>
    </div>
  );
}
