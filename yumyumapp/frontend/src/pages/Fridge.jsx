import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  viewFridge,
  addFridgeItem,
  removeFridgeItem,
  clearFridge,
} from "../lib/api_fridge";

export default function Fridge() {
  const { token } = useAuth();
  const [fridge, setFridge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const fetchFridgeContents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fridgeData = await viewFridge(token);
      setFridge(fridgeData);
    } catch (err) {
      setError(err.message || "Failed to fetch fridge contents.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFridgeContents();
    }
  }, [token, fetchFridgeContents]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setError("Item name cannot be empty.");
      return;
    }
    try {
      await addFridgeItem(token, {
        name: newItemName,
        quantity: newItemQuantity,
      });
      setNewItemName("");
      setNewItemQuantity(1);
      await fetchFridgeContents(); // Refresh list
    } catch (err) {
      setError(err.message || "Failed to add item.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFridgeItem(token, itemId);
      await fetchFridgeContents(); // Refresh list
    } catch (err) {
      setError(err.message || "Failed to remove item.");
    }
  };

  const handleClearFridge = async () => {
    if (window.confirm("Are you sure you want to clear your entire fridge?")) {
      try {
        await clearFridge(token);
        await fetchFridgeContents(); // Refresh list
      } catch (err) {
        setError(err.message || "Failed to clear fridge.");
      }
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>My Fridge</h1>
      <nav>
        <Link to="/home">Home</Link> |{" "}
        <Link to="/calender">Calendar</Link>
      </nav>

      <div style={{ marginTop: "20px" }}>
        <h3>Add New Item</h3>
        <form onSubmit={handleAddItem} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
            required
            style={{ padding: 8 }}
          />
          <input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
            min="1"
            style={{ padding: 8, width: "60px" }}
          />
          <button type="submit" style={{ padding: "8px 12px" }}>Add Item</button>
        </form>
      </div>

      {error && <div style={{ color: "crimson", marginTop: "20px" }}>{error}</div>}

      <div style={{ marginTop: "30px" }}>
        <h2>Fridge Contents</h2>
        {loading ? (
          <p>Loading...</p>
        ) : fridge && fridge.items.length > 0 ? (
          <>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {fridge.items.map((item) => (
                <li key={item.id} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", maxWidth: "400px" }}>
                  <span>{item.name} (Quantity: {item.quantity})</span>
                  <button onClick={() => handleRemoveItem(item.id)} style={{ background: "crimson", color: "white", border: "none", cursor: "pointer" }}>Remove</button>
                </li>
              ))}
            </ul>
            <Link to="/recipes">
                <button style={{ marginTop: "20px", marginRight: "10px", padding: "10px 15px", background: "royalblue", color: "white", border: "none", cursor: "pointer" }}>Recommend Recipes</button>
            </Link>
            <button onClick={handleClearFridge} style={{ marginTop: "20px", background: "darkred", color: "white" }}>Clear Entire Fridge</button>
          </>
        ) : (
          <p>Your fridge is empty.</p>
        )}
      </div>
    </div>
  );
}
