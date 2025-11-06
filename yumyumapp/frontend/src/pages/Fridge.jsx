import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import {
  viewFridge,
  addFridgeItem,
  updateFridgeItemQuantity,
  removeFridgeItem,
  clearFridge,
} from "../lib/api_fridge";

const LOCAL_STORAGE_KEY = "yumyumapp.fridge.itemMeta";
const STORAGE_OPTIONS = ["All", "Fridge", "Freezer", "Pantry"];

const SAMPLE_ITEMS = [
  {
    name: "Bread",
    quantity: 1,
    unit: "loaf",
    storage: "Pantry",
    addedOn: "2025-11-02",
    expiresOn: "2025-11-07",
  },
  {
    name: "Chicken Breast",
    quantity: 3,
    unit: "pcs",
    storage: "Freezer",
    addedOn: "2025-10-28",
    expiresOn: "2026-04-28",
  },
  {
    name: "Eggs",
    quantity: 12,
    unit: "pcs",
    storage: "Fridge",
    addedOn: "2025-11-01",
    expiresOn: "2025-11-15",
  },
  {
    name: "Frozen Peas",
    quantity: 2,
    unit: "bag",
    storage: "Freezer",
    addedOn: "2025-10-20",
    expiresOn: "2026-01-20",
  },
  {
    name: "Garlic",
    quantity: 8,
    unit: "cloves",
    storage: "Pantry",
    addedOn: "2025-10-30",
    expiresOn: "",
  },
  {
    name: "Greek Yogurt",
    quantity: 4,
    unit: "cup",
    storage: "Fridge",
    addedOn: "2025-11-01",
    expiresOn: "2025-11-12",
  },
  {
    name: "Milk",
    quantity: 1,
    unit: "qt",
    storage: "Fridge",
    addedOn: "2025-11-02",
    expiresOn: "2025-11-09",
  },
  {
    name: "Olive Oil",
    quantity: 1,
    unit: "bottle",
    storage: "Pantry",
    addedOn: "2025-08-15",
    expiresOn: "",
  },
  {
    name: "Rice",
    quantity: 5,
    unit: "lb",
    storage: "Pantry",
    addedOn: "2025-10-10",
    expiresOn: "",
  },
  {
    name: "Spinach",
    quantity: 2,
    unit: "bag",
    storage: "Fridge",
    addedOn: "2025-11-03",
    expiresOn: "2025-11-07",
  },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7ff",
    padding: "48px 56px",
    fontFamily: "'Inter', sans-serif",
    color: "#0f172a",
  },
  nav: {
    marginBottom: 24,
    display: "flex",
    gap: 12,
    fontSize: 14,
  },
  content: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gap: 28,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#0f172a",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 20,
  },
  headerText: {
    display: "grid",
    gap: 2,
  },
  headerHeading: {
    margin: 0,
    fontSize: 26,
    fontWeight: 600,
  },
  headerSubtext: {
    margin: 0,
    fontSize: 14,
    color: "#64748b",
  },
  headerActions: {
    display: "flex",
    gap: 12,
  },
  ghostButton: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #cbd5f5",
    background: "#fff",
    padding: "0 18px",
    fontSize: 14,
    fontWeight: 500,
    color: "#0f172a",
    cursor: "pointer",
  },
  dangerButton: {
    height: 40,
    borderRadius: 12,
    border: "none",
    background: "#ef4444",
    padding: "0 18px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 18px 30px rgba(239, 68, 68, 0.25)",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolbarLeft: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  search: {
    width: 260,
    maxWidth: "100%",
    height: 42,
    borderRadius: 14,
    border: "1px solid #d1d5db",
    padding: "0 16px",
    fontSize: 14,
    background: "#fff",
  },
  filterChip: (active) => ({
    height: 36,
    borderRadius: 12,
    border: active ? "1px solid #1d4ed8" : "1px solid #e2e8f0",
    background: active ? "rgba(37, 99, 235, 0.12)" : "#fff",
    color: active ? "#1d4ed8" : "#475569",
    padding: "0 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }),
  sortControls: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  select: {
    height: 40,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
  },
  sortDirection: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    fontSize: 16,
  },
  tableCard: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 22px 48px rgba(15, 23, 42, 0.12)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  tableHeadCell: {
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: "0.08em",
    color: "#94a3b8",
    padding: "18px 20px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
  },
  tableCell: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#0f172a",
  },
  itemNameCell: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 6,
    border: "1px solid #cbd5f5",
    cursor: "pointer",
  },
  unitPill: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "#e0ecff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "lowercase",
  },
  itemName: {
    fontSize: 15,
    fontWeight: 600,
  },
  muted: {
    color: "#94a3b8",
  },
  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 15,
  },
  addCard: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    padding: "28px 32px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.1)",
    display: "grid",
    gap: 20,
  },
  addGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
  },
  dateInput: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
  },
  addButtonRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  primaryButton: {
    height: 48,
    borderRadius: 14,
    border: "none",
    background: "#0f172a",
    padding: "0 22px",
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.4)",
  },
  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: -10,
  },
  errorBanner: {
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 500,
  },
  successBanner: {
    background: "#dcfce7",
    color: "#15803d",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 500,
  },
  removeButton: {
    border: "none",
    background: "transparent",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  quantityCell: {
    minWidth: 120,
    textAlign: "center",
  },
  quantityContainer: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  stepperButton: (isVisible) => ({
    width: 18,
    height: 18,
    borderRadius: 4,
    border: "1px solid #cbd5f5",
    background: "#fff",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    padding: 0,
    transition: "all 0.15s ease",
    flexShrink: 0,
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? "auto" : "none",
  }),
  quantityText: {
    display: "inline-block",
    minWidth: 50,
    whiteSpace: "nowrap",
    textAlign: "center",
  },
};

function loadMetadata() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("Failed to parse fridge metadata from storage:", err);
    return {};
  }
}

function isExpiringWithinWeek(expirationDate) {
  if (!expirationDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  return expDate <= oneWeekFromNow;
}

export default function Fridge() {
  const { token } = useAuth();

  const [fridge, setFridge] = useState(null);
  const [metadata, setMetadata] = useState(() => loadMetadata());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [storageFilter, setStorageFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [autoSeedAttempted, setAutoSeedAttempted] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "",
    storage: "Fridge",
    addedOn: new Date().toISOString().slice(0, 10),
    expiresOn: "",
  });

  const updateMetadata = useCallback((updater) => {
    setMetadata((prev) => {
      const previous = prev && typeof prev === "object" ? prev : {};
      const next =
        typeof updater === "function" ? updater(previous) : updater || {};
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist fridge metadata:", err);
      }
      return next;
    });
  }, []);

  const fetchFridgeContents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      setStatus(null);
      const fridgeData = await viewFridge(token);
      setFridge(fridgeData);

      // Prune metadata that no longer has a matching item
      updateMetadata((prevMeta) => {
        const filtered = {};
        fridgeData.items.forEach((item) => {
          if (prevMeta && prevMeta[item.id]) {
            filtered[item.id] = prevMeta[item.id];
          }
        });
        return filtered;
      });
    } catch (err) {
      setError(err.message || "Failed to fetch fridge contents.");
    } finally {
      setLoading(false);
    }
  }, [token, updateMetadata]);

  const handleSeedSampleItems = useCallback(
    async ({ existingItems = [], silent = false } = {}) => {
      if (!token || seeding)
        return { success: false, createdCount: 0, message: null };

      try {
        if (!silent) {
          setError(null);
          setStatus(null);
        }
        setSeeding(true);

        const existingNames = new Set(
          existingItems.map((item) => item.name.toLowerCase())
        );

        let createdCount = 0;
        for (const sample of SAMPLE_ITEMS) {
          if (existingNames.has(sample.name.toLowerCase())) {
            continue;
          }
          const created = await addFridgeItem(token, {
            name: sample.name,
            quantity: sample.quantity,
          });
          existingNames.add(sample.name.toLowerCase());
          createdCount += 1;
          updateMetadata((prev) => ({
            ...prev,
            [created.id]: {
              unit: sample.unit,
              storage: sample.storage,
              addedOn: sample.addedOn,
              expiresOn: sample.expiresOn,
            },
          }));
        }

        const message =
          createdCount === 0
            ? "Sample items are already in your fridge."
            : "Sample ingredients added.";

        if (!silent) {
          setStatus(message);
        }

        return { success: true, createdCount, message };
      } catch (err) {
        const message = err?.message || "Failed to add sample items.";
        if (silent) {
          setError(
            'Could not auto add sample data. Use "Add Sample Items" after connecting to the server.'
          );
        } else {
          setError(message);
        }
        return { success: false, createdCount: 0, message: null };
      } finally {
        setSeeding(false);
      }
    },
    [token, seeding, updateMetadata]
  );

  useEffect(() => {
    fetchFridgeContents();
  }, [fetchFridgeContents]);

  useEffect(() => {
    if (
      !token ||
      loading ||
      seeding ||
      autoSeedAttempted ||
      !fridge ||
      !Array.isArray(fridge.items) ||
      fridge.items.length > 0
    ) {
      return;
    }

    setAutoSeedAttempted(true);
    handleSeedSampleItems({
      existingItems: fridge.items,
      silent: true,
    }).then((result) => {
      if (result?.success && result.createdCount > 0) {
        fetchFridgeContents();
      }
    });
  }, [
    token,
    loading,
    seeding,
    autoSeedAttempted,
    fridge,
    handleSeedSampleItems,
    fetchFridgeContents,
  ]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      setError("Item name cannot be empty.");
      return;
    }
    if (newItem.quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      setError(null);
      setStatus(null);
      const created = await addFridgeItem(token, {
        name: newItem.name.trim(),
        quantity: Number(newItem.quantity) || 1,
      });

      updateMetadata((prev) => ({
        ...prev,
        [created.id]: {
          unit: newItem.unit.trim(),
          storage: newItem.storage,
          addedOn: newItem.addedOn || new Date().toISOString().slice(0, 10),
          expiresOn: newItem.expiresOn,
        },
      }));

      setNewItem({
        name: "",
        quantity: 1,
        unit: "",
        storage: newItem.storage,
        addedOn: new Date().toISOString().slice(0, 10),
        expiresOn: "",
      });
      setStatus("Item added to your fridge.");
      await fetchFridgeContents();
    } catch (err) {
      setError(err.message || "Failed to add item.");
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      setError(null);
      setStatus(null);

      // Optimistic update - update local state immediately
      setFridge((prevFridge) => {
        if (!prevFridge) return prevFridge;

        if (newQuantity <= 0) {
          // Remove item if quantity is 0
          return {
            ...prevFridge,
            items: prevFridge.items.filter((item) => item.id !== itemId),
          };
        }

        return {
          ...prevFridge,
          items: prevFridge.items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          ),
        };
      });

      const result = await updateFridgeItemQuantity(token, itemId, newQuantity);

      if (result === null) {
        // Item was removed due to quantity reaching 0
        updateMetadata((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        setSelectedIds((prev) => prev.filter((id) => id !== itemId));
      }
    } catch (err) {
      setError(err.message || "Failed to update quantity.");
      // Revert on error
      await fetchFridgeContents();
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setError(null);
      setStatus(null);
      await removeFridgeItem(token, itemId);
      updateMetadata((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      setSelectedIds((prev) => prev.filter((id) => id !== itemId));
      setStatus("Item removed.");
      await fetchFridgeContents();
    } catch (err) {
      setError(err.message || "Failed to remove item.");
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      setError(null);
      setStatus(null);
      const ids = [...selectedIds];
      for (const id of ids) {
        await removeFridgeItem(token, id);
      }
      updateMetadata((prev) => {
        const next = { ...prev };
        ids.forEach((id) => {
          delete next[id];
        });
        return next;
      });
      setSelectedIds([]);
      setStatus("Selected items removed.");
      await fetchFridgeContents();
    } catch (err) {
      setError(err.message || "Failed to remove selected items.");
    }
  };

  const handleClearFridge = async () => {
    if (!window.confirm("Clear all items from your fridge?")) return;
    try {
      setError(null);
      setStatus(null);
      await clearFridge(token);
      updateMetadata({});
      setSelectedIds([]);
      setStatus("Fridge cleared.");
      await fetchFridgeContents();
    } catch (err) {
      setError(err.message || "Failed to clear fridge.");
    }
  };

  const toggleSelectItem = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = (items) => {
    const allSelected = items.length > 0 && selectedIds.length === items.length;
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const enhancedItems = useMemo(() => {
    if (!fridge) return [];
    return fridge.items.map((item) => ({
      ...item,
      meta: metadata[item.id] || {},
    }));
  }, [fridge, metadata]);

  const filteredItems = useMemo(() => {
    const filtered = enhancedItems.filter((item) => {
      const searchMatch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const currentStorage = item.meta.storage || "Unassigned";
      const storageMatch =
        storageFilter === "All" ||
        currentStorage.toLowerCase() === storageFilter.toLowerCase();
      return searchMatch && storageMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      if (sortBy === "quantity") {
        return (Number(a.quantity) - Number(b.quantity)) * dir;
      }
      if (sortBy === "addedOn") {
        const aDate = a.meta.addedOn ? new Date(a.meta.addedOn).getTime() : 0;
        const bDate = b.meta.addedOn ? new Date(b.meta.addedOn).getTime() : 0;
        return (aDate - bDate) * dir;
      }
      if (sortBy === "expiresOn") {
        const aDate = a.meta.expiresOn
          ? new Date(a.meta.expiresOn).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bDate = b.meta.expiresOn
          ? new Date(b.meta.expiresOn).getTime()
          : Number.MAX_SAFE_INTEGER;
        return (aDate - bDate) * dir;
      }
      return 0;
    });

    return sorted;
  }, [
    enhancedItems,
    searchTerm,
    storageFilter,
    sortBy,
    sortDirection,
  ]);

  const allItemsSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.content}>
          <nav style={styles.nav}>
            <Link to="/home">← Back to Home</Link>
            <span>•</span>
            <Link to="/calender">Meal Planner</Link>
          </nav>

        <div style={styles.headerRow}>
          <div style={styles.headerTitle}>
            <div style={styles.headerIcon}>☰</div>
            <div style={styles.headerText}>
              <h1 style={styles.headerHeading}>All Food Ingredients</h1>
              <p style={styles.headerSubtext}>
                Track every item across your fridge, freezer, and pantry.
              </p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.ghostButton}
              disabled={selectedIds.length === 0}
              onClick={handleRemoveSelected}
            >
              Remove Selected ({selectedIds.length})
            </button>
            <button
              type="button"
              style={styles.dangerButton}
              onClick={handleClearFridge}
            >
              Clear All
            </button>
            <button
              type="button"
              style={styles.ghostButton}
              onClick={async () => {
                const result = await handleSeedSampleItems({
                  existingItems: fridge?.items || [],
                  silent: false,
                });
                if (result?.success && result.createdCount > 0) {
                  await fetchFridgeContents();
                }
                if (result?.message) {
                  setStatus(result.message);
                }
              }}
              disabled={loading || seeding}
            >
              {seeding ? "Adding…" : "Add Sample Items"}
            </button>
          </div>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}
        {status && !error && <div style={styles.successBanner}>{status}</div>}

        <section style={styles.addCard}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
              Quick add ingredient
            </h2>
            <p style={styles.headerSubtext}>
              Fill in the details below to keep your inventory up to date.
            </p>
          </div>

          <form onSubmit={handleAddItem} style={{ display: "grid", gap: 18 }}>
            <div style={styles.addGrid}>
              <label>
                <div style={styles.label}>Item name</div>
                <input
                  style={styles.input}
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Greek Yogurt"
                  required
                />
              </label>

              <label>
                <div style={styles.label}>Quantity</div>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  required
                />
              </label>

              <label>
                <div style={styles.label}>Unit</div>
                <input
                  style={styles.input}
                  type="text"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  placeholder="e.g., loaf, pcs, bottle"
                />
              </label>

              <label>
                <div style={styles.label}>Storage area</div>
                <select
                  style={styles.select}
                  value={newItem.storage}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, storage: e.target.value }))
                  }
                >
                  <option value="Fridge">Fridge</option>
                  <option value="Freezer">Freezer</option>
                  <option value="Pantry">Pantry</option>
                </select>
              </label>

              <label>
                <div style={styles.label}>Date added</div>
                <input
                  style={styles.dateInput}
                  type="date"
                  value={newItem.addedOn}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, addedOn: e.target.value }))
                  }
                />
              </label>

              <label>
                <div style={styles.label}>Expires on</div>
                <input
                  style={styles.dateInput}
                  type="date"
                  value={newItem.expiresOn}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      expiresOn: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <span style={styles.helperText}>
              Hint: expiration dates are optional but help you stay ahead of
              food waste.
            </span>
            <div style={styles.addButtonRow}>
              <button type="submit" style={styles.primaryButton}>
                Add ingredient
              </button>
            </div>
          </form>
        </section>

        <div style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <input
              style={styles.search}
              type="search"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {STORAGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                style={styles.filterChip(storageFilter === option)}
                onClick={() => setStorageFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={styles.sortControls}>
            <select
              style={styles.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
              <option value="addedOn">Date added</option>
              <option value="expiresOn">Expiry</option>
            </select>
            <button
              type="button"
              style={styles.sortDirection}
              onClick={() =>
                setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <section style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading your ingredients…</div>
          ) : filteredItems.length === 0 ? (
            <div style={styles.emptyState}>
              {searchTerm || storageFilter !== "All"
                ? "No items match your current search."
                : "Your fridge is empty. Start by adding your first ingredient above!"}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeadCell}>
                    <input
                      type="checkbox"
                      checked={allItemsSelected}
                      onChange={() => toggleSelectAll(filteredItems)}
                      style={styles.checkbox}
                    />
                  </th>
                  <th style={styles.tableHeadCell}>Item</th>
                  <th style={{ ...styles.tableHeadCell, textAlign: "center" }}>
                    Quantity
                  </th>
                  <th style={styles.tableHeadCell}>Storage</th>
                  <th style={styles.tableHeadCell}>Added</th>
                  <th style={styles.tableHeadCell}>Expires</th>
                  <th style={styles.tableHeadCell}></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const { unit, storage, addedOn, expiresOn } = item.meta;
                  return (
                    <tr key={item.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          style={styles.checkbox}
                        />
                      </td>
                      <td style={{ ...styles.tableCell }}>
                        <div style={styles.itemNameCell}>
                          <span style={styles.unitPill}>
                            {(unit || "qty").toLowerCase()}
                          </span>
                          <span style={styles.itemName}>{item.name}</span>
                        </div>
                      </td>
                      <td
                        style={{ ...styles.tableCell, ...styles.quantityCell }}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                      >
                        <div style={styles.quantityContainer}>
                          <button
                            style={styles.stepperButton(hoveredItemId === item.id)}
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span style={styles.quantityText}>
                            {item.quantity} {unit ? unit.toLowerCase() : ""}
                          </span>
                          <button
                            style={styles.stepperButton(hoveredItemId === item.id)}
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        {storage || (
                          <span style={styles.muted}>Unassigned</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {addedOn ? (
                          addedOn
                        ) : (
                          <span style={styles.muted}>—</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {expiresOn ? (
                          <span
                            style={{
                              color: isExpiringWithinWeek(expiresOn)
                                ? "#ef4444"
                                : "#0f172a",
                              fontWeight: isExpiringWithinWeek(expiresOn)
                                ? 600
                                : "normal",
                            }}
                          >
                            {expiresOn}
                          </span>
                        ) : (
                          <span style={styles.muted}>—</span>
                        )}
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: "right" }}>
                        <button
                          type="button"
                          style={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
        </div>
      </div>
    </>
  );
}
