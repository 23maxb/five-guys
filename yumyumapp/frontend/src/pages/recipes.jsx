import React, {useState, useEffect, useMemo, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import {findRecipesByIngredients} from "../lib/api_recipe.ts";

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "'Inter', sans-serif",
        color: "#111827",
    },
    hero: {
        background: "linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
    },
    heroDecoration: {
        position: "absolute",
        fontSize: 120,
        opacity: 0.1,
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
    },
    toolbar: {
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
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
    recipeGrid: {
        display: "grid",
        gap: "28px",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    },
    recipeCard: {
        background: "#fff",
        borderRadius: 16,
        border: "2px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 200ms ease",
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        },
    },
    recipeImage: {
        width: "100%",
        height: 200,
        objectFit: "cover",
        display: "block",
    },
    recipeContent: {
        padding: "16px 20px 20px",
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: 700,
        margin: "0 0 12px",
        lineHeight: 1.4,
    },
    recipeInfo: {
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        fontSize: 13,
        color: "#6b7280",
    },
    infoChip: (type) => ({
        padding: "4px 10px",
        borderRadius: 8,
        fontWeight: 600,
        background: type === "used" ? "#dcfce7" : "#fee2e2",
        color: type === "used" ? "#166534" : "#991b1b",
    }),
    recipeDetails: {
        padding: "0 20px 20px",
        marginTop: 16,
        borderTop: "1px solid #f3f4f6",
        paddingTop: 16,
    },
    detailTitle: {
        fontSize: 14,
        fontWeight: 700,
        margin: "0 0 8px",
        color: "#374151",
    },
    ingredientList: {
        margin: 0,
        paddingLeft: 20,
        fontSize: 13,
        color: "#4b5563",
        display: "grid",
        gap: 4,
    },
    viewButton: {
        display: "inline-block",
        marginTop: 16,
        padding: "8px 16px",
        background: "#f97316",
        color: "#fff",
        borderRadius: 8,
        textAlign: "center",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 14,
        border: "none",
        cursor: "pointer",
        transition: "background-color 150ms ease",
        "&:hover": {
            background: "#ea580c",
        },
    },
    emptyState: {
        padding: "80px 20px",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: 15,
        background: "#fff",
        borderRadius: 16,
        border: "2px dashed #e5e7eb",
    },
    errorBanner: {
        background: "#fee2e2",
        color: "#b91c1c",
        borderRadius: 12,
        padding: "14px 16px",
        fontSize: 13,
        fontWeight: 500,
        border: "2px solid #fecaca",
        marginBottom: 24,
    },
};

export default function Recipes() {
    const {token} = useAuth();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("used-desc");
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    const fetchRecipes = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const data = await findRecipesByIngredients(token);
            if (data.message) {
                setError(data.message);
                setRecipes([]);
            } else {
                setRecipes(data);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch recipes.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    const handleRecipeClick = (recipeId) => {
        setSelectedRecipeId((prevId) => (prevId === recipeId ? null : recipeId));
    };

    const filteredAndSortedRecipes = useMemo(() => {
        const filtered = recipes.filter((recipe) =>
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case "used-desc":
                    return b.usedIngredientCount - a.usedIngredientCount;
                case "missed-asc":
                    return a.missedIngredientCount - b.missedIngredientCount;
                case "likes-desc":
                    return b.likes - a.likes;
                default:
                    return 0;
            }
        });
    }, [recipes, searchTerm, sortBy]);

    return (
        <>
            <Navbar/>
            <div style={styles.page}>
                <section style={styles.hero}>
                    <div style={{...styles.heroDecoration, top: -20, left: 60}}>🍳</div>
                    <div style={{...styles.heroDecoration, top: 40, right: 100}}>🍲</div>
                    <div style={{...styles.heroDecoration, bottom: -30, right: 200}}>🍝</div>
                    <div style={styles.heroContent}>
                        <h1 style={styles.heroTitle}>📖 Recipe Finder</h1>
                        <p style={styles.heroSubtext}>
                            Discover delicious meals you can make with what you already have.
                        </p>
                    </div>
                </section>

                <div style={styles.content}>
                    <div style={styles.toolbar}>
                        <input
                            style={styles.search}
                            type="search"
                            placeholder="Search recipes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div style={styles.sortControls}>
                            <select
                                style={styles.select}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="used-desc">Ingredients: Most Used</option>
                                <option value="missed-asc">Ingredients: Fewest Missing</option>
                                <option value="likes-desc">Most Popular</option>
                            </select>
                        </div>
                    </div>

                    {error && <div style={styles.errorBanner}>{error}</div>}

                    {loading ? (
                        <div style={styles.emptyState}>Finding recipes for you...</div>
                    ) : filteredAndSortedRecipes.length > 0 ? (
                        <div style={styles.recipeGrid}>
                            {filteredAndSortedRecipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    style={styles.recipeCard}
                                    onClick={() => handleRecipeClick(recipe.id)}
                                >
                                    <img
                                        src={recipe.image}
                                        alt={recipe.title}
                                        style={styles.recipeImage}
                                    />
                                    <div style={styles.recipeContent}>
                                        <h3 style={styles.recipeTitle}>{recipe.title}</h3>
                                        <div style={styles.recipeInfo}>
                                            <span style={styles.infoChip("used")}>
                                                ✓ {recipe.usedIngredientCount} Used
                                            </span>
                                            <span style={styles.infoChip("missed")}>
                                                ! {recipe.missedIngredientCount} Missing
                                            </span>
                                        </div>
                                        <button
                                            style={styles.viewButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/recipes/${recipe.id}`);
                                            }}
                                        >
                                            View Recipe
                                        </button>
                                    </div>

                                    {selectedRecipeId === recipe.id && (
                                        <div style={styles.recipeDetails}>
                                            {recipe.usedIngredients.length > 0 && (
                                                <>
                                                    <h4 style={styles.detailTitle}>Your Ingredients:</h4>
                                                    <ul style={styles.ingredientList}>
                                                        {recipe.usedIngredients.map((ing) => (
                                                            <li key={`used-${ing.id}`}>{ing.original}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                            {recipe.missedIngredients.length > 0 && (
                                                <>
                                                    <h4 style={{...styles.detailTitle, marginTop: 12}}>
                                                        Missing Ingredients:
                                                    </h4>
                                                    <ul style={styles.ingredientList}>
                                                        {recipe.missedIngredients.map((ing) => (
                                                            <li key={`missed-${ing.id}`}>{ing.original}</li>
                                                        ))}
                                                    </ul>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            {searchTerm
                                ? "No recipes match your search."
                                : "No recipes found with your current ingredients. Try adding more items to your fridge!"}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
