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
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

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

  const fridgeStyles = {
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "2rem",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
      paddingBottom: "1rem",
      borderBottom: "2px solid #e2e8f0",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#1e293b",
      margin: 0,
    },
    nav: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
    },
    navLink: {
      color: "#64748b",
      textDecoration: "none",
      fontSize: "0.9rem",
      transition: "color 0.2s",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
    },
    addSection: {
      backgroundColor: "white",
      padding: "1.5rem",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      marginBottom: "2rem",
    },
    sectionTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "1rem",
    },
    form: {
      display: "flex",
      gap: "0.75rem",
      alignItems: "flex-end",
      flexWrap: "wrap",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      flex: 1,
      minWidth: "200px",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#475569",
    },
    input: {
      padding: "0.75rem",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "1rem",
      transition: "all 0.2s",
      backgroundColor: "#fff",
    },
    quantityInput: {
      width: "100px",
    },
    addButton: {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    },
    addButtonHover: {
      backgroundColor: "#1d4ed8",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
      padding: "1rem",
      borderRadius: "8px",
      marginBottom: "1rem",
      border: "1px solid #fecaca",
    },
    contentsSection: {
      backgroundColor: "white",
      padding: "1.5rem",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    itemsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
      marginTop: "1rem",
    },
    itemCard: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "1.25rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.2s",
      position: "relative",
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: "1.1rem",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "0.25rem",
    },
    itemQuantity: {
      fontSize: "0.875rem",
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    quantityBadge: {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
      padding: "0.25rem 0.75rem",
      borderRadius: "12px",
      fontSize: "0.875rem",
      fontWeight: "600",
    },
    removeButton: {
      padding: "0.5rem 1rem",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    removeButtonHover: {
      backgroundColor: "#dc2626",
      transform: "scale(1.05)",
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#64748b",
    },
    emptyIcon: {
      fontSize: "4rem",
      marginBottom: "1rem",
      opacity: 0.5,
    },
    emptyText: {
      fontSize: "1.125rem",
      marginBottom: "0.5rem",
    },
    clearButton: {
      marginTop: "1.5rem",
      padding: "0.75rem 1.5rem",
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "0.875rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    clearButtonHover: {
      backgroundColor: "#b91c1c",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    itemCardHover: {
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
    loadingState: {
      textAlign: "center",
      padding: "2rem",
      color: "#64748b",
    },
  };

  return (
    <div style={fridgeStyles.container}>
      <div style={fridgeStyles.header}>
        <h1 style={fridgeStyles.title}>🧊 My Fridge</h1>
        <nav style={fridgeStyles.nav}>
          <Link to="/home" style={fridgeStyles.navLink}>Home</Link>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <Link to="/calender" style={fridgeStyles.navLink}>Calendar</Link>
        </nav>
      </div>

      <div style={fridgeStyles.addSection}>
        <h3 style={fridgeStyles.sectionTitle}>Add New Item</h3>
        <form onSubmit={handleAddItem} style={fridgeStyles.form}>
          <div style={fridgeStyles.inputGroup}>
            <label style={fridgeStyles.label}>Item Name</label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g., Milk, Eggs, Bread"
              required
              style={fridgeStyles.input}
            />
          </div>
          <div style={fridgeStyles.inputGroup}>
            <label style={fridgeStyles.label}>Quantity</label>
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(Number(e.target.value))}
              min="1"
              style={{ ...fridgeStyles.input, ...fridgeStyles.quantityInput }}
            />
          </div>
          <button 
            type="submit" 
            style={{
              ...fridgeStyles.addButton,
              ...(hoveredButton === 'add' ? fridgeStyles.addButtonHover : {})
            }}
            onMouseEnter={() => setHoveredButton('add')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            ➕ Add Item
          </button>
        </form>
      </div>

      {error && (
        <div style={fridgeStyles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      <div style={fridgeStyles.contentsSection}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={fridgeStyles.sectionTitle}>Fridge Contents</h2>
          {fridge && fridge.items.length > 0 && (
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
              {fridge.items.length} item{fridge.items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {loading ? (
          <div style={fridgeStyles.loadingState}>
            <p>Loading your fridge...</p>
          </div>
        ) : fridge && fridge.items.length > 0 ? (
          <>
            <div style={fridgeStyles.itemsGrid}>
              {fridge.items.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    ...fridgeStyles.itemCard,
                    ...(hoveredItem === item.id ? fridgeStyles.itemCardHover : {})
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={fridgeStyles.itemInfo}>
                    <div style={fridgeStyles.itemName}>{item.name}</div>
                    <div style={fridgeStyles.itemQuantity}>
                      <span style={fridgeStyles.quantityBadge}>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id)} 
                    style={{
                      ...fridgeStyles.removeButton,
                      ...(hoveredButton === `remove-${item.id}` ? fridgeStyles.removeButtonHover : {})
                    }}
                    onMouseEnter={() => setHoveredButton(`remove-${item.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleClearFridge} 
              style={{
                ...fridgeStyles.clearButton,
                ...(hoveredButton === 'clear' ? fridgeStyles.clearButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton('clear')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              🗑️ Clear Entire Fridge
            </button>
          </>
        ) : (
          <div style={fridgeStyles.emptyState}>
            <div style={fridgeStyles.emptyIcon}>🧊</div>
            <div style={fridgeStyles.emptyText}>Your fridge is empty</div>
            <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
              Add some items to get started!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
