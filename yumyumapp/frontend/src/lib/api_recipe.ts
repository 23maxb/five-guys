const API_BASE_URL = 'http://localhost:8000/api';

// This is the summary object for a recipe, used in lists.
export interface Recipe {
    id: number;
    title: string;
    image: string;
    imageType: string;
    usedIngredientCount: number;
    missedIngredientCount: number;
    missedIngredients: {
        id: number;
        amount: number;
        unit: string;
        name: string;
        original: string;
    }[];
    usedIngredients: {
        id: number;
        amount: number;
        unit: string;
        name: string;
        original: string;
    }[];
    likes: number;
}

// --- Interfaces for detailed recipe data from get_recipe_information ---

export interface ExtendedIngredient {
    id: number;
    aisle: string;
    image: string;
    consistency: string;
    name: string;
    nameClean?: string;
    original: string;
    originalName?: string;
    amount: number;
    unit: string;
    meta: string[];
    measures: {
        us: {
            amount: number;
            unitShort: string;
            unitLong: string;
        };
        metric: {
            amount: number;
            unitShort: string;
            unitLong: string;
        };
    };
}

export interface AnalyzedInstructionStep {
    number: number;
    step: string;
}

export interface AnalyzedInstruction {
    name: string;
    steps: AnalyzedInstructionStep[];
}

// This is the full recipe details object.
export interface RecipeDetails extends Recipe {
    summary: string;
    sourceUrl: string;
    analyzedInstructions: AnalyzedInstruction[];
    extendedIngredients: ExtendedIngredient[];
    readyInMinutes: number;
    servings: number;
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    veryHealthy?: boolean;
    cheap?: boolean;
    veryPopular?: boolean;
    sustainable?: boolean;
    lowFodmap?: boolean;
    weightWatcherSmartPoints?: number;
    gaps?: string;
    preparationMinutes?: number | null;
    cookingMinutes?: number | null;
    healthScore?: number;
    creditsText?: string;
    license?: string;
    sourceName?: string;
    pricePerServing?: number;
    cuisines?: string[];
    dishTypes?: string[];
    diets?: string[];
    occasions?: string[];
    instructions?: string;
}


/**
 * Finds recipes based on ingredients in the user's fridge.
 * @param token The user's authentication token.
 * @returns The list of recipes or an error message.
 */
export async function findRecipesByIngredients(token: string): Promise<Recipe[]> {
    const response = await fetch(`${API_BASE_URL}/recipes/find-by-ingredients/`, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch recipes');
    }

    return data;
};

/**
 * Gets the full details for a single recipe, including instructions.
 * @param token The user's authentication token.
 * @param recipeId The ID of the recipe to fetch.
 * @returns The detailed recipe information.
 */
export async function getRecipeDetails(token: string, recipeId: number): Promise<RecipeDetails> {
    const headers = {
        'Authorization': `Token ${token}`,
    };

    const infoPromise = fetch(`${API_BASE_URL}/recipes/${recipeId}/information/`, { headers });
    const instructionsPromise = fetch(`${API_BASE_URL}/recipes/${recipeId}/analyzedInstructions/`, { headers });

    const [infoResponse, instructionsResponse] = await Promise.all([infoPromise, instructionsPromise]);

    if (!infoResponse.ok) {
        const data = await infoResponse.json();
        throw new Error(data.message || data.error || 'Failed to fetch recipe details');
    }

    if (!instructionsResponse.ok) {
        const data = await instructionsResponse.json();
        throw new Error(data.message || data.error || 'Failed to fetch recipe instructions');
    }

    const infoData = await infoResponse.json();
    const instructionsData = await instructionsResponse.json();

    // The get-recipe-information endpoint provides rich recipe data, but does not
    // have the context of the user's fridge. So, we can't get used/missed ingredient counts.
    return {
        id: infoData.id,
        title: infoData.title,
        image: infoData.image,
        imageType: infoData.imageType,
        likes: infoData.aggregateLikes,
        summary: infoData.summary,
        sourceUrl: infoData.sourceUrl,
        analyzedInstructions: instructionsData,
        extendedIngredients: infoData.extendedIngredients,
        readyInMinutes: infoData.readyInMinutes,
        servings: infoData.servings,
        vegetarian: infoData.vegetarian,
        vegan: infoData.vegan,
        glutenFree: infoData.glutenFree,
        dairyFree: infoData.dairyFree,
        veryHealthy: infoData.veryHealthy,
        cheap: infoData.cheap,
        veryPopular: infoData.veryPopular,
        sustainable: infoData.sustainable,
        lowFodmap: infoData.lowFodmap,
        weightWatcherSmartPoints: infoData.weightWatcherSmartPoints,
        gaps: infoData.gaps,
        preparationMinutes: infoData.preparationMinutes,
        cookingMinutes: infoData.cookingMinutes,
        healthScore: infoData.healthScore,
        creditsText: infoData.creditsText,
        license: infoData.license,
        sourceName: infoData.sourceName,
        pricePerServing: infoData.pricePerServing,
        cuisines: infoData.cuisines,
        dishTypes: infoData.dishTypes,
        diets: infoData.diets,
        occasions: infoData.occasions,
        instructions: infoData.instructions,

        // Fields from Recipe interface that are not in the get-information response.
        usedIngredientCount: 0,
        missedIngredientCount: 0,
        usedIngredients: [],
        missedIngredients: [],
    };
}
