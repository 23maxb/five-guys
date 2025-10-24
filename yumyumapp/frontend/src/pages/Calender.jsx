import React from "react";
import { Link } from "react-router-dom";

export default function Calendar() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Calendar Page</h1>
      <nav>
        <Link to="/home">Home</Link> |{" "}
        <Link to="/fridge">Fridge</Link>
      </nav>
      <p>Calendar functionality will be implemented here.</p>
    </div>
  );
}
