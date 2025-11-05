import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { findRecipesByIngredients } from '../lib/api_recipe.ts';

export default function Recipes() {
    const { token } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!token) return;

            try {
                setLoading(true);
                setError(null);
                const data = await findRecipesByIngredients(token);
                if (data.message) { // Handle cases like an empty fridge
                    setError(data.message);
                    setRecipes([]);
                } else {
                    setRecipes(data);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch recipes.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [token]);

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1>Recommended Recipes</h1>
            <nav>
                <Link to="/home">Home</Link> | <Link to="/fridge">My Fridge</Link>
            </nav>

            {error && <div style={{ color: 'crimson', marginTop: '20px' }}>{error}</div>}

            <div style={{ marginTop: '30px' }}>
                {loading ? (
                    <p>Finding recipes...</p>
                ) : recipes.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {recipes.map((recipe) => (
                            <li key={recipe.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                                <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                                <h3 style={{ fontSize: '1.1em', marginTop: '10px' }}>{recipe.title}</h3>
                                <p style={{ fontSize: '0.9em', color: '#555' }}>
                                    Uses {recipe.usedIngredientCount} of your ingredients.
                                </p>
                                {recipe.missedIngredientCount > 0 && (
                                    <p style={{ fontSize: '0.9em', color: '#888' }}>
                                        You're missing {recipe.missedIngredientCount} ingredients.
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : !error && (
                    <p>No recipes found with your current ingredients.</p>
                )}
            </div>
        </div>
    );
}