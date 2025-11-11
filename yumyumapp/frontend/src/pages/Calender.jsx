import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";
import { findRecipesByIngredients } from "../lib/api_recipe.ts";

const LOCAL_STORAGE_KEY = "yumyumapp.calendar.mealPlan";
const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"];

const FALLBACK_RECIPES = [
  {
    id: "sample-1",
    title: "Lemon Herb Chicken Bowl",
    image:
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80",
    readyInMinutes: 30,
    servings: 4,
    usedIngredientCount: 6,
    missedIngredientCount: 1,
    mood: "Bright & zesty",
  },
  {
    id: "sample-2",
    title: "Miso Glazed Salmon",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    readyInMinutes: 25,
    servings: 2,
    usedIngredientCount: 5,
    missedIngredientCount: 0,
    mood: "Umami rich",
  },
  {
    id: "sample-3",
    title: "Green Goddess Grain Bowl",
    image:
      "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80",
    readyInMinutes: 20,
    servings: 2,
    usedIngredientCount: 7,
    missedIngredientCount: 2,
    mood: "Fresh & crunchy",
  },
  {
    id: "sample-4",
    title: "Roasted Veggie Pasta",
    image:
      "https://images.unsplash.com/photo-1521389508051-d7ffb5dc8e8d?auto=format&fit=crop&w=800&q=80",
    readyInMinutes: 35,
    servings: 3,
    usedIngredientCount: 6,
    missedIngredientCount: 2,
    mood: "Comforting classic",
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
    padding: "48px 24px",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: 1280,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 12,
    marginTop: 0,
    textShadow: "0 4px 30px rgba(0,0,0,0.2)",
  },
  heroSubtext: {
    fontSize: 18,
    color: "rgba(255,255,255,0.92)",
    maxWidth: 640,
    marginBottom: 28,
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  heroStatCard: (borderColor) => ({
    background: "rgba(255,255,255,0.2)",
    border: `1px solid ${borderColor}`,
    borderRadius: 16,
    padding: 20,
    backdropFilter: "blur(10px)",
  }),
  heroStatLabel: {
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
  },
  heroStatValue: {
    fontSize: 34,
    fontWeight: 700,
    color: "#fff",
  },
  heroCTA: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    padding: "10px 18px",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 999,
    fontWeight: 600,
    textDecoration: "none",
    fontSize: 14,
  },
  content: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "30px 24px 60px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  layout: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #e5e7eb",
    padding: 24,
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 12,
  },
  sectionSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    marginBottom: 16,
  },
  recipeList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: 540,
    overflowY: "auto",
    paddingRight: 6,
  },
  recipeCard: (isSelected) => ({
    display: "grid",
    gridTemplateColumns: "64px 1fr",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    border: `1px solid ${isSelected ? "#10b981" : "#e5e7eb"}`,
    background: isSelected ? "#ecfdf5" : "#f9fafb",
    alignItems: "center",
  }),
  recipeThumb: {
    width: 64,
    height: 64,
    objectFit: "cover",
    borderRadius: 12,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
    color: "#0f172a",
  },
  recipeMeta: {
    fontSize: 12,
    color: "#6b7280",
    margin: "4px 0 8px",
  },
  recipeButton: (isSelected) => ({
    border: "none",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    background: isSelected ? "#10b981" : "#e5e7eb",
    color: isSelected ? "#fff" : "#374151",
  }),
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  weekButton: {
    border: "none",
    background: "#f3f4f6",
    color: "#111827",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  weekLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  dayCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    background: "#fdfefe",
  },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
  },
  dayDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  slot: {
    borderRadius: 12,
    background: "#fff",
    border: "1px dashed #d1d5db",
    padding: 12,
    marginBottom: 10,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
  },
  slotEmpty: {
    fontSize: 12,
    color: "#9ca3af",
    margin: "6px 0 12px",
  },
  assignButton: (disabled) => ({
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "8px 0",
    fontSize: 13,
    fontWeight: 600,
    background: disabled ? "#e5e7eb" : "#10b981",
    color: disabled ? "#6b7280" : "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
  }),
  plannedRecipe: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    color: "#374151",
    margin: "8px 0 12px",
  },
  removeButton: {
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  clearDayButton: {
    width: "100%",
    border: "none",
    background: "#f3f4f6",
    color: "#6b7280",
    borderRadius: 10,
    padding: "8px 0",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  selectedRecipeCard: {
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    display: "flex",
    gap: 14,
    padding: 14,
    background: "#f9fafb",
    marginBottom: 20,
    alignItems: "center",
  },
  selectedRecipeImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    objectFit: "cover",
  },
  emptySelected: {
    fontSize: 14,
    color: "#6b7280",
  },
};

const getStartOfWeek = (date) => {
  const instance = new Date(date);
  const day = (instance.getDay() + 6) % 7;
  instance.setHours(0, 0, 0, 0);
  instance.setDate(instance.getDate() - day);
  return instance;
};

const formatDateKey = (date) => date.toISOString().split("T")[0];

const snapshotRecipe = (recipe) => ({
  id: recipe.id,
  title: recipe.title,
  image: recipe.image,
  readyInMinutes: recipe.readyInMinutes,
  servings: recipe.servings,
  mood: recipe.mood,
});

const formatWeekRangeLabel = (weekDays) => {
  if (!weekDays.length) return "";
  const first = weekDays[0].dateObj;
  const last = weekDays[weekDays.length - 1].dateObj;
  const startText = first.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endText = last.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${startText} – ${endText}`;
};

export default function Calendar() {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState(FALLBACK_RECIPES);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState(
    FALLBACK_RECIPES[0]?.id || null
  );
  const [mealPlan, setMealPlan] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getStartOfWeek(new Date())
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setMealPlan(JSON.parse(stored));
      } catch (storageError) {
        console.warn("Failed to parse stored meal plan", storageError);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!token) {
        setLoadingRecipes(false);
        return;
      }

      try {
        setLoadingRecipes(true);
        setError("");
        const data = await findRecipesByIngredients(token);
        if (Array.isArray(data) && data.length) {
          setRecipes(data);
          setSelectedRecipeId(data[0]?.id ?? null);
        } else if (Array.isArray(data) && data.length === 0) {
          setError("We couldn't find recipes with your current ingredients.");
          setRecipes(FALLBACK_RECIPES);
          setSelectedRecipeId(FALLBACK_RECIPES[0]?.id ?? null);
        } else if (data?.message) {
          setError(data.message);
        }
      } catch (apiError) {
        setError(apiError.message || "Failed to load recipes");
        setRecipes(FALLBACK_RECIPES);
        setSelectedRecipeId(FALLBACK_RECIPES[0]?.id ?? null);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [token]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + index);
      return {
        key: formatDateKey(date),
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        dateLabel: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        dateObj: date,
      };
    });
  }, [currentWeekStart]);

  const weekRangeLabel = formatWeekRangeLabel(weekDays);

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return recipes;
    return recipes.filter((recipe) =>
      recipe.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipes, searchTerm]);

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) || null,
    [recipes, selectedRecipeId]
  );

  const plannedMealsCount = useMemo(() => {
    return weekDays.reduce((sum, day) => {
      const slots = mealPlan[day.key] || {};
      return sum + Object.keys(slots).length;
    }, 0);
  }, [mealPlan, weekDays]);

  const openSlotsCount = useMemo(() => {
    return weekDays.reduce((slots, day) => {
      const planned = Object.keys(mealPlan[day.key] || {}).length;
      return slots + Math.max(MEAL_SLOTS.length - planned, 0);
    }, 0);
  }, [mealPlan, weekDays]);

  const hasAnyPlan = useMemo(
    () =>
      Object.values(mealPlan).some(
        (dayPlan) => dayPlan && Object.keys(dayPlan).length > 0
      ),
    [mealPlan]
  );

  const handleWeekChange = (direction) => {
    setCurrentWeekStart((prev) => {
      const updated = new Date(prev);
      updated.setDate(updated.getDate() + direction * 7);
      return getStartOfWeek(updated);
    });
  };

  const handleAssignRecipe = (dayKey, slot) => {
    if (!selectedRecipe) return;
    setMealPlan((prev) => {
      const dayPlan = prev[dayKey] || {};
      const updatedPlan = {
        ...prev,
        [dayKey]: { ...dayPlan, [slot]: snapshotRecipe(selectedRecipe) },
      };
      return updatedPlan;
    });
  };

  const handleRemoveRecipe = (dayKey, slot) => {
    setMealPlan((prev) => {
      if (!prev[dayKey]) return prev;
      const dayPlan = { ...prev[dayKey] };
      delete dayPlan[slot];
      const next = { ...prev };
      if (Object.keys(dayPlan).length === 0) {
        delete next[dayKey];
      } else {
        next[dayKey] = dayPlan;
      }
      return next;
    });
  };

  const handleClearDay = (dayKey) => {
    setMealPlan((prev) => {
      if (!prev[dayKey]) return prev;
      const next = { ...prev };
      delete next[dayKey];
      return next;
    });
  };

  const handleResetPlan = () => setMealPlan({});

  return (
    <div style={styles.page}>
      <Navbar />

      <header style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.heroTitle}>Plan a delicious week</p>
          <p style={styles.heroSubtext}>
            Drag your favorite recipes into the week, keep an eye on open meal
            slots, and keep your fridge in sync with your cravings.
          </p>

          <div style={styles.heroStats}>
            <div style={styles.heroStatCard("rgba(16,185,129,0.6)")}>
              <p style={styles.heroStatLabel}>Meals Scheduled</p>
              <p style={styles.heroStatValue}>{plannedMealsCount}</p>
            </div>
            <div style={styles.heroStatCard("rgba(59,130,246,0.6)")}>
              <p style={styles.heroStatLabel}>Open Slots</p>
              <p style={styles.heroStatValue}>{openSlotsCount}</p>
            </div>
            <div style={styles.heroStatCard("rgba(249,115,22,0.6)")}>
              <p style={styles.heroStatLabel}>Active Week</p>
              <p style={styles.heroStatValue}>{weekRangeLabel}</p>
            </div>
          </div>

          <Link to="/recipes" style={styles.heroCTA}>
            Explore more recipes →
          </Link>
        </div>
      </header>

      <main style={styles.content}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            style={{
              ...styles.weekButton,
              opacity: hasAnyPlan ? 1 : 0.5,
              cursor: hasAnyPlan ? "pointer" : "not-allowed",
            }}
            onClick={handleResetPlan}
            disabled={!hasAnyPlan}
          >
            Clear entire plan
          </button>
        </div>

        <section style={styles.layout}>
          <div style={styles.card}>
            <p style={styles.sectionTitle}>Recipes</p>
            <p style={styles.sectionSubtext}>
              Pick a recipe to assign to a meal slot. We load your fridge-powered
              recommendations automatically when available.
            </p>
            <input
              type="text"
              placeholder="Search recipes"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={styles.searchInput}
            />
            {loadingRecipes ? (
              <p style={{ color: "#6b7280", fontSize: 14 }}>Loading recipes…</p>
            ) : error ? (
              <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>
            ) : null}
            <div style={styles.recipeList}>
              {filteredRecipes.map((recipe) => {
                const isSelected = selectedRecipeId === recipe.id;
                return (
                  <div key={recipe.id} style={styles.recipeCard(isSelected)}>
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      style={styles.recipeThumb}
                    />
                    <div>
                      <p style={styles.recipeTitle}>{recipe.title}</p>
                      <p style={styles.recipeMeta}>
                        {recipe.usedIngredientCount ?? "–"} used •{" "}
                        {recipe.missedIngredientCount ?? "0"} missing •{" "}
                        {recipe.readyInMinutes
                          ? `${recipe.readyInMinutes} min`
                          : "Quick bite"}
                      </p>
                      <button
                        style={styles.recipeButton(isSelected)}
                        onClick={() => setSelectedRecipeId(recipe.id)}
                      >
                        {isSelected ? "Selected" : "Plan this"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!filteredRecipes.length && !loadingRecipes && (
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  No recipes match that search yet.
                </p>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.selectedRecipeCard}>
              {selectedRecipe ? (
                <>
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    style={styles.selectedRecipeImage}
                  />
                  <div>
                    <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                      Currently assigning
                    </p>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        margin: "4px 0",
                      }}
                    >
                      {selectedRecipe.title}
                    </p>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                      {selectedRecipe.readyInMinutes
                        ? `${selectedRecipe.readyInMinutes} min • `
                        : ""}
                      Serves {selectedRecipe.servings ?? "2"}
                    </p>
                  </div>
                </>
              ) : (
                <p style={styles.emptySelected}>
                  Select a recipe from the list to start planning.
                </p>
              )}
            </div>

            <div style={styles.calendarHeader}>
              <button
                style={styles.weekButton}
                onClick={() => handleWeekChange(-1)}
              >
                ← Previous
              </button>
              <p style={styles.weekLabel}>{weekRangeLabel}</p>
              <button
                style={styles.weekButton}
                onClick={() => handleWeekChange(1)}
              >
                Next →
              </button>
            </div>

            <div style={styles.planGrid}>
              {weekDays.map((day) => {
                const dayPlan = mealPlan[day.key] || {};
                return (
                  <div key={day.key} style={styles.dayCard}>
                    <div style={styles.dayHeader}>
                      <p style={styles.dayTitle}>{day.label}</p>
                      <p style={styles.dayDate}>{day.dateLabel}</p>
                    </div>
                    {MEAL_SLOTS.map((slot) => {
                      const planned = dayPlan[slot];
                      return (
                        <div key={slot} style={styles.slot}>
                          <p style={styles.slotLabel}>{slot}</p>
                          {planned ? (
                            <>
                              <div style={styles.plannedRecipe}>
                                <strong>{planned.title}</strong>
                                <span>
                                  {planned.readyInMinutes
                                    ? `${planned.readyInMinutes} min • `
                                    : ""}
                                  Serves {planned.servings ?? "2"}
                                </span>
                              </div>
                              <button
                                style={styles.removeButton}
                                onClick={() => handleRemoveRecipe(day.key, slot)}
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <>
                              <p style={styles.slotEmpty}>
                                No meal yet. Assign one from the left.
                              </p>
                              <button
                                style={styles.assignButton(!selectedRecipe)}
                                disabled={!selectedRecipe}
                                onClick={() => handleAssignRecipe(day.key, slot)}
                              >
                                {selectedRecipe ? "Assign recipe" : "Select recipe"}
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                    <button
                      style={{
                        ...styles.clearDayButton,
                        opacity: Object.keys(dayPlan).length ? 1 : 0.5,
                        cursor: Object.keys(dayPlan).length
                          ? "pointer"
                          : "not-allowed",
                      }}
                      onClick={() => handleClearDay(day.key)}
                      disabled={!Object.keys(dayPlan).length}
                    >
                      Clear day
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
