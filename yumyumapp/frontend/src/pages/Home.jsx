import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../lib/api";
import { viewFridge } from "../lib/api_fridge";
import { findRecipesByIngredients } from "../lib/api_recipe";
import Navbar from "../components/Navbar";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
  },
  hero: {
    background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: 1280,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  greeting: {
    fontSize: 42,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 12,
    textShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  subGreeting: {
    fontSize: 18,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 32,
  },
  featuredStat: {
    display: "inline-block",
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 16,
    padding: "20px 32px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  featuredStatNumber: {
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 4,
  },
  featuredStatLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  heroWithStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 40,
    alignItems: "start",
  },
  heroLeft: {
    paddingRight: 20,
  },
  heroStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  heroStatCard: (color) => ({
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    border: `2px solid ${color}15`,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    transition: "transform 150ms ease, box-shadow 150ms ease",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  }),
  heroDecoration: {
    position: "absolute",
    fontSize: 120,
    opacity: 0.15,
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "30px 24px",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 24,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
    marginBottom: 48,
  },
  statCard: (color) => ({
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: `2px solid ${color}15`,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "transform 150ms ease, box-shadow 150ms ease",
  }),
  statIcon: (bgColor) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    background: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    marginBottom: 16,
  }),
  statNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
    marginBottom: 12,
  },
  statDetail: {
    fontSize: 13,
    color: "#9ca3af",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    marginBottom: 48,
  },
  actionCard: (bgColor, hoverColor) => ({
    background: bgColor,
    borderRadius: 16,
    padding: "32px 28px",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    transition: "transform 150ms ease, box-shadow 150ms ease",
    textDecoration: "none",
    display: "block",
  }),
  actionIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  recentList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  recentItem: {
    padding: "12px 0",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentItemName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },
  recentItemDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyState: {
    textAlign: "center",
    padding: "32px 0",
    color: "#9ca3af",
    fontSize: 14,
  },
  loading: {
    textAlign: "center",
    padding: "60px 0",
    color: "#6b7280",
    fontSize: 16,
  },
};

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fridge, setFridge] = useState(null);
  const [recipeCount, setRecipeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch user profile
        const { user: userData } = await getUserProfile(token);
        setUser(userData);

        // Fetch fridge data
        const fridgeData = await viewFridge(token);
        setFridge(fridgeData);

        // Calculate expiring items (items expiring in next 7 days)
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Get metadata from localStorage
        const LOCAL_STORAGE_KEY = "yumyumapp.fridge.itemMeta";
        let metadata = {};
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          metadata = raw ? JSON.parse(raw) : {};
        } catch (err) {
          console.warn("Failed to parse fridge metadata:", err);
        }

        let expiring = 0;
        fridgeData.items.forEach((item) => {
          const meta = metadata[item.id] || {};
          if (meta.expiresOn) {
            const expiryDate = new Date(meta.expiresOn);
            if (expiryDate >= today && expiryDate <= sevenDaysFromNow) {
              expiring++;
            }
          }
        });
        setExpiringCount(expiring);

        // Fetch recipe count
        try {
          const recipes = await findRecipesByIngredients(token);
          if (Array.isArray(recipes)) {
            setRecipeCount(recipes.length);
          }
        } catch (err) {
          console.warn("Failed to fetch recipes:", err);
          setRecipeCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Get recent items (last 5 added)
  const getRecentItems = () => {
    if (!fridge || !fridge.items) return [];

    const LOCAL_STORAGE_KEY = "yumyumapp.fridge.itemMeta";
    let metadata = {};
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      metadata = raw ? JSON.parse(raw) : {};
    } catch (err) {
      return [];
    }

    const itemsWithDates = fridge.items
      .map((item) => ({
        ...item,
        addedOn: metadata[item.id]?.addedOn || null,
      }))
      .filter((item) => item.addedOn)
      .sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn))
      .slice(0, 5);

    return itemsWithDates;
  };

  // Get storage breakdown
  const getStorageBreakdown = () => {
    if (!fridge || !fridge.items) return { fridge: 0, freezer: 0, pantry: 0 };

    const LOCAL_STORAGE_KEY = "yumyumapp.fridge.itemMeta";
    let metadata = {};
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      metadata = raw ? JSON.parse(raw) : {};
    } catch (err) {
      return { fridge: 0, freezer: 0, pantry: 0 };
    }

    const breakdown = { fridge: 0, freezer: 0, pantry: 0 };
    fridge.items.forEach((item) => {
      const storage = metadata[item.id]?.storage?.toLowerCase() || "fridge";
      if (storage === "fridge") breakdown.fridge++;
      else if (storage === "freezer") breakdown.freezer++;
      else if (storage === "pantry") breakdown.pantry++;
    });

    return breakdown;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>Loading your dashboard...</div>
      </>
    );
  }

  const userName = user?.name || user?.email?.split("@")[0] || "there";
  const totalItems = fridge?.items?.length || 0;
  const recentItems = getRecentItems();
  const storageBreakdown = getStorageBreakdown();

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        {/* Hero Section with Stats */}
        <section style={styles.hero}>
          <div style={{ ...styles.heroDecoration, top: -20, left: 60 }}>🥗</div>
          <div style={{ ...styles.heroDecoration, top: 40, right: 100 }}>🍎</div>
          <div style={{ ...styles.heroDecoration, bottom: -30, right: 200 }}>🥕</div>

          <div style={styles.heroContent}>
            <div style={styles.heroWithStats}>
              {/* Left: Welcome Message */}
              <div style={styles.heroLeft}>
                <h1 style={styles.greeting}>Welcome back, {userName}!</h1>
                <p style={styles.subGreeting}>
                  Here's what's happening in your kitchen today
                </p>

                <div style={styles.featuredStat}>
                  <div style={styles.featuredStatNumber}>
                    {expiringCount > 0 ? expiringCount : totalItems}
                  </div>
                  <div style={styles.featuredStatLabel}>
                    {expiringCount > 0
                      ? `item${expiringCount !== 1 ? 's' : ''} expiring this week`
                      : `item${totalItems !== 1 ? 's' : ''} in your kitchen`}
                  </div>
                </div>
              </div>

              {/* Right: Kitchen Overview Cards in 2x2 Grid */}
              <div style={styles.heroStatsGrid}>
            {/* Total Inventory */}
            <div
              style={styles.heroStatCard("#10b981")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              <div style={styles.statIcon("#d1fae5")}>🥗</div>
              <div style={styles.statNumber}>{totalItems}</div>
              <div style={styles.statLabel}>Total Ingredients</div>
              <div style={styles.statDetail}>
                Fridge: {storageBreakdown.fridge} • Freezer: {storageBreakdown.freezer} • Pantry: {storageBreakdown.pantry}
              </div>
            </div>

            {/* Expiring Soon */}
            <div
              style={styles.heroStatCard("#ef4444")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              <div style={styles.statIcon("#fee2e2")}>⏰</div>
              <div style={styles.statNumber}>{expiringCount}</div>
              <div style={styles.statLabel}>Expiring This Week</div>
              <div style={styles.statDetail}>
                {expiringCount === 0
                  ? "All items are fresh!"
                  : "Check your fridge to reduce waste"}
              </div>
            </div>

            {/* Available Recipes */}
            <div
              style={styles.heroStatCard("#f59e0b")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              <div style={styles.statIcon("#fef3c7")}>👨‍🍳</div>
              <div style={styles.statNumber}>{recipeCount}</div>
              <div style={styles.statLabel}>Recipes Available</div>
              <div style={styles.statDetail}>
                {recipeCount === 0
                  ? "Add ingredients to discover recipes"
                  : "Based on your current ingredients"}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              style={styles.heroStatCard("#8b5cf6")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              <div style={styles.statIcon("#ede9fe")}>📝</div>
              <div style={styles.statNumber}>{recentItems.length}</div>
              <div style={styles.statLabel}>Recent Additions</div>
              <div style={styles.statDetail}>
                {recentItems.length === 0
                  ? "No recent items"
                  : `Last added: ${recentItems[0]?.name || 'N/A'}`}
              </div>
            </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Container */}
        <div style={styles.container}>
          {/* Quick Actions */}
          <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <a
              href="/fridge"
              onClick={(e) => {
                e.preventDefault();
                navigate("/fridge");
              }}
              style={styles.actionCard("#10b981", "#059669")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                e.currentTarget.style.background = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.background = "#10b981";
              }}
            >
              <div style={styles.actionIcon}>🥗</div>
              <div style={styles.actionTitle}>Add Ingredients</div>
              <div style={styles.actionDescription}>
                Stock up your virtual fridge, freezer, and pantry
              </div>
            </a>

            <a
              href="/recipes"
              onClick={(e) => {
                e.preventDefault();
                navigate("/recipes");
              }}
              style={styles.actionCard("#f59e0b", "#d97706")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                e.currentTarget.style.background = "#d97706";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.background = "#f59e0b";
              }}
            >
              <div style={styles.actionIcon}>👨‍🍳</div>
              <div style={styles.actionTitle}>Find Recipes</div>
              <div style={styles.actionDescription}>
                Discover delicious recipes with what you have
              </div>
            </a>

            <a
              href="/calender"
              onClick={(e) => {
                e.preventDefault();
                navigate("/calender");
              }}
              style={styles.actionCard("#8b5cf6", "#7c3aed")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
                e.currentTarget.style.background = "#7c3aed";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.background = "#8b5cf6";
              }}
            >
              <div style={styles.actionIcon}>📅</div>
              <div style={styles.actionTitle}>Plan Meals</div>
              <div style={styles.actionDescription}>
                Organize your weekly meal schedule
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
