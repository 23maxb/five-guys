import React, { useState, useEffect, useCallback, useMemo } from "react";
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
const AUTO_SEED_STORAGE_KEY = "yumyumapp.fridge.autoSeeded";

const SAMPLE_ITEMS = [
  {
    name: "Bread",
    quantity: 1,
    storage: "Pantry",
    addedOn: "2025-11-02",
    expiresOn: "2025-11-07",
  },
  {
    name: "Chicken Breast",
    quantity: 3,
    storage: "Freezer",
    addedOn: "2025-10-28",
    expiresOn: "2026-04-28",
  },
  {
    name: "Eggs",
    quantity: 12,
    storage: "Fridge",
    addedOn: "2025-11-01",
    expiresOn: "2025-11-15",
  },
  {
    name: "Frozen Peas",
    quantity: 2,
    storage: "Freezer",
    addedOn: "2025-10-20",
    expiresOn: "2026-01-20",
  },
  {
    name: "Garlic",
    quantity: 8,
    storage: "Pantry",
    addedOn: "2025-10-30",
    expiresOn: "",
  },
  {
    name: "Greek Yogurt",
    quantity: 4,
    storage: "Fridge",
    addedOn: "2025-11-01",
    expiresOn: "2025-11-12",
  },
  {
    name: "Milk",
    quantity: 1,
    storage: "Fridge",
    addedOn: "2025-11-02",
    expiresOn: "2025-11-09",
  },
  {
    name: "Olive Oil",
    quantity: 1,
    storage: "Pantry",
    addedOn: "2025-08-15",
    expiresOn: "",
  },
  {
    name: "Rice",
    quantity: 5,
    storage: "Pantry",
    addedOn: "2025-10-10",
    expiresOn: "",
  },
  {
    name: "Spinach",
    quantity: 2,
    storage: "Fridge",
    addedOn: "2025-11-03",
    expiresOn: "2025-11-07",
  },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "'Inter', sans-serif",
    color: "#111827",
  },
  hero: {
    background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
  },
  heroDecoration: {
    position: "absolute",
    fontSize: 120,
    opacity: 0.15,
  },
  heroContent: {
    maxWidth: 1280,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 12,
    textShadow: "0 2px 10px rgba(0,0,0,0.1)",
    margin: 0,
  },
  heroSubtext: {
    fontSize: 18,
    color: "rgba(255,255,255,0.95)",
    margin: 0,
  },
  content: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "30px 24px",
    display: "grid",
    gap: 28,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  headerActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryButton: {
    height: 44,
    borderRadius: 12,
    border: "none",
    background: "#10b981",
    padding: "0 20px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
    transition: "all 150ms ease",
  },
  secondaryButton: {
    height: 44,
    borderRadius: 12,
    border: "2px solid #10b981",
    background: "#fff",
    padding: "0 20px",
    fontSize: 14,
    fontWeight: 600,
    color: "#10b981",
    cursor: "pointer",
    transition: "all 150ms ease",
  },
  dangerButton: {
    height: 44,
    borderRadius: 12,
    border: "none",
    background: "#ef4444",
    padding: "0 20px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
    transition: "all 150ms ease",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
    height: 44,
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    padding: "0 16px",
    fontSize: 14,
    background: "#fff",
    transition: "border-color 150ms ease",
  },
  filterChip: (active) => ({
    height: 40,
    borderRadius: 12,
    border: active ? "2px solid #10b981" : "2px solid #e5e7eb",
    background: active ? "#d1fae5" : "#fff",
    color: active ? "#065f46" : "#6b7280",
    padding: "0 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 150ms ease",
  }),
  sortControls: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  select: {
    height: 44,
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
    cursor: "pointer",
  },
  tableCard: {
    background: "#fff",
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
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
    color: "#6b7280",
    padding: "18px 20px",
    borderBottom: "2px solid #e5e7eb",
    textAlign: "left",
    fontWeight: 700,
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background-color 150ms ease",
  },
  tableCell: {
    padding: "16px 20px",
    fontSize: 14,
    color: "#111827",
  },
  itemNameCell: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    border: "2px solid #10b981",
    cursor: "pointer",
    accentColor: "#10b981",
  },
  itemName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  muted: {
    color: "#9ca3af",
  },
  emptyState: {
    padding: "80px 20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 15,
  },
  addCard: {
    background: "#fff",
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    padding: "28px 32px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    display: "grid",
    gap: 20,
  },
  addGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    display: "block",
  },
  input: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
    transition: "border-color 150ms ease",
    boxSizing: "border-box",
  },
  numberInput: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
    transition: "border-color 150ms ease",
    boxSizing: "border-box",
  },
  dateInput: {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: "2px solid #e5e7eb",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
    transition: "border-color 150ms ease",
    boxSizing: "border-box",
  },
  addButtonRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#10b981",
    padding: "0 24px",
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
    transition: "all 150ms ease",
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: -10,
  },
  errorBanner: {
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 500,
    border: "2px solid #fecaca",
  },
  successBanner: {
    background: "#d1fae5",
    color: "#065f46",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 13,
    fontWeight: 500,
    border: "2px solid #a7f3d0",
  },
  removeButton: {
    border: "none",
    background: "transparent",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "color 150ms ease",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 12,
    margin: 0,
  },
  sectionSubtext: {
    fontSize: 14,
    color: "#6b7280",
    margin: 0,
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

function loadAutoSeedAttempted() {
  try {
    return localStorage.getItem(AUTO_SEED_STORAGE_KEY) === "1";
  } catch (err) {
    console.warn("Failed to read fridge auto seed flag:", err);
    return false;
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [autoSeedAttempted, setAutoSeedAttempted] = useState(() =>
    loadAutoSeedAttempted()
  );
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "1",
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

  const updateAutoSeedAttempted = useCallback((updater) => {
    setAutoSeedAttempted((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : Boolean(updater);
      if (next) {
        try {
          localStorage.setItem(AUTO_SEED_STORAGE_KEY, "1");
        } catch (err) {
          console.warn("Failed to persist fridge auto seed flag:", err);
        }
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
      updateAutoSeedAttempted((previous) => {
        if (previous) return true;
        return Array.isArray(fridgeData.items) && fridgeData.items.length > 0;
      });

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
  }, [token, updateMetadata, updateAutoSeedAttempted]);

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
        if (createdCount > 0) {
          updateAutoSeedAttempted(true);
        }

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
    [token, seeding, updateMetadata, updateAutoSeedAttempted]
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

    updateAutoSeedAttempted(true);
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
    updateAutoSeedAttempted,
  ]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      setError("Item name cannot be empty.");
      return;
    }

    const quantityInput = typeof newItem.quantity === "string"
      ? newItem.quantity.trim()
      : String(newItem.quantity || "");

    if (!quantityInput) {
      setError("Quantity is required.");
      return;
    }

    const parsedQuantity = Number(quantityInput);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      setError(null);
      setStatus(null);
      const created = await addFridgeItem(token, {
        name: newItem.name.trim(),
        quantity: parsedQuantity,
      });

      updateMetadata((prev) => ({
        ...prev,
        [created.id]: {
          storage: newItem.storage,
          addedOn: newItem.addedOn || new Date().toISOString().slice(0, 10),
          expiresOn: newItem.expiresOn,
        },
      }));

      setNewItem({
        name: "",
        quantity: "1",
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
      updateAutoSeedAttempted(true);
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
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "quantity") {
        return Number(a.quantity) - Number(b.quantity);
      }
      if (sortBy === "addedOn") {
        const aDate = a.meta.addedOn ? new Date(a.meta.addedOn).getTime() : 0;
        const bDate = b.meta.addedOn ? new Date(b.meta.addedOn).getTime() : 0;
        return aDate - bDate;
      }
      if (sortBy === "expiresOn") {
        const aDate = a.meta.expiresOn
          ? new Date(a.meta.expiresOn).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bDate = b.meta.expiresOn
          ? new Date(b.meta.expiresOn).getTime()
          : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }
      return 0;
    });

    return sorted;
  }, [
    enhancedItems,
    searchTerm,
    storageFilter,
    sortBy,
  ]);

  const allItemsSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const totalItems = useMemo(() => {
    if (!fridge || !Array.isArray(fridge.items)) return 0;
    return fridge.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
  }, [fridge]);

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={{ ...styles.heroDecoration, top: -20, left: 60 }}>🥗</div>
          <div style={{ ...styles.heroDecoration, top: 40, right: 100 }}>🍎</div>
          <div style={{ ...styles.heroDecoration, bottom: -30, right: 200 }}>🥕</div>

          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>🧊 Food Inventory</h1>
            <p style={styles.heroSubtext}>
              Track every item across your fridge, freezer, and pantry
            </p>
          </div>
        </section>

        <div style={styles.content}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.sectionTitle}>Your Ingredients</h2>
              <p style={styles.sectionSubtext}>
                {totalItems} item{totalItems !== 1 ? 's' : ''} in your kitchen
              </p>
            </div>
            <div style={styles.headerActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                disabled={selectedIds.length === 0}
                onClick={handleRemoveSelected}
                onMouseEnter={(e) => {
                  if (selectedIds.length > 0) {
                    e.currentTarget.style.background = "#10b981";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#10b981";
                }}
              >
                Remove Selected ({selectedIds.length})
              </button>
              <button
                type="button"
                style={styles.dangerButton}
                onClick={handleClearFridge}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ef4444";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(239, 68, 68, 0.3)";
                }}
              >
                Clear All
              </button>
              <button
                type="button"
                style={styles.secondaryButton}
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
                onMouseEnter={(e) => {
                  if (!loading && !seeding) {
                    e.currentTarget.style.background = "#10b981";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#10b981";
                }}
              >
                {seeding ? "Adding…" : "Add Sample Items"}
              </button>
            </div>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}
          {status && !error && <div style={styles.successBanner}>{status}</div>}

          <section style={styles.addCard}>
            <div>
              <h2 style={styles.sectionTitle}>Quick Add Ingredient</h2>
              <p style={styles.sectionSubtext}>
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
                  step="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  required
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
                    const { storage, addedOn, expiresOn } = item.meta;
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
                              {item.quantity}
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
