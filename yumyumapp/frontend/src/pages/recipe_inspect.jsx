import React, {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import {getRecipeDetails} from '../lib/api_recipe.ts';
import Navbar from '../components/Navbar';

const styles = {
    page: {
        minHeight: '100vh',
        background: '#f9fafb',
        fontFamily: "'Inter', sans-serif",
        color: '#111827',
    },
    content: {
        maxWidth: 900,
        margin: '0 auto',
        padding: '30px 24px',
    },
    loadingState: {
        textAlign: 'center',
        padding: '80px 0',
        fontSize: 16,
        color: '#6b7280',
    },
    errorBanner: {
        background: '#fee2e2',
        color: '#b91c1c',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: 14,
        fontWeight: 500,
        border: '2px solid #fecaca',
        marginBottom: 24,
    },
    header: {
        marginBottom: 24,
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: 800,
        margin: '0 0 12px',
    },
    summary: {
        fontSize: 16,
        lineHeight: 1.6,
        color: '#4b5563',
    },
    recipeLayout: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: 32,
        alignItems: 'flex-start',
    },
    mainContent: {},
    sidebar: {
        position: 'sticky',
        top: 30,
    },
    image: {
        width: '100%',
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    },
    section: {
        background: '#fff',
        borderRadius: 16,
        border: '2px solid #e5e7eb',
        padding: '24px',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 700,
        margin: '0 0 16px',
    },
    instructions: {
        fontSize: 15,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap', // respects newlines
    },
    ingredientList: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gap: 10,
    },
    ingredientItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: '#374151',
        fontSize: 14,
    },
    sourceLink: {
        display: 'inline-block',
        marginTop: 16,
        fontSize: 14,
        color: '#f97316',
        fontWeight: 600,
        textDecoration: 'none',
    },
};

export default function RecipeInspect() {
    const {token} = useAuth();
    const {recipeId} = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token || !recipeId) return;

            try {
                setLoading(true);
                setError(null);
                const details = await getRecipeDetails(token, parseInt(recipeId, 10));
                setRecipe(details);
            } catch (err) {
                setError(err.message || 'Failed to load recipe details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [token, recipeId]);

    return (
        <>
            <Navbar/>
            <div style={styles.page}>
                <div style={styles.content}>
                    <Link to="/recipes" style={{
                        textDecoration: 'none',
                        color: '#f97316',
                        fontWeight: 600,
                        marginBottom: '20px',
                        display: 'block'
                    }}>&larr; Back to Recipes</Link>

                    {loading && <div style={styles.loadingState}>Loading recipe details...</div>}
                    {error && <div style={styles.errorBanner}>{error}</div>}

                    {recipe && (
                        <>
                            <header style={styles.header}>
                                <h1 style={styles.title}>{recipe.title}</h1>
                                <p style={styles.summary} dangerouslySetInnerHTML={{__html: recipe.summary}}/>
                            </header>

                            <div style={styles.recipeLayout}>
                                <div style={styles.mainContent}>
                                    <img src={recipe.image} alt={recipe.title} style={styles.image}/>
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Instructions</h2>
                                        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps.length > 0 ? (
                                            recipe.analyzedInstructions.map((instruction, index) => (
                                                <div key={index}>
                                                    {instruction.name && <h3 style={{fontSize: 18, fontWeight: 600, margin: '16px 0'}}>{instruction.name}</h3>}
                                                    <ol style={{paddingLeft: 20, margin: 0, display: 'grid', gap: 12}}>
                                                        {instruction.steps.map(step => (
                                                            <li key={step.number} style={{lineHeight: 1.6, fontSize: 15}}>{step.step}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={styles.instructions}>{recipe.instructions}</p>
                                        )}
                                        {recipe.sourceUrl && (
                                            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                                               style={styles.sourceLink}>
                                                View Original Recipe &rarr;
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.sidebar}>
                                    <div style={styles.section}>
                                        <h2 style={styles.sectionTitle}>Ingredients</h2>
                                        <ul style={styles.ingredientList}>
                                            {recipe.extendedIngredients && recipe.extendedIngredients.map((ing, index) => (
                                                <li key={index} style={styles.ingredientItem}>
                                                    <span>-</span>
                                                    <span>{ing.original}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
