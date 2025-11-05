const API_BASE_URL = 'http://localhost:8000/api';

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