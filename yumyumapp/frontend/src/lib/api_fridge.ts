const API_BASE_URL = 'http://localhost:8000/api';

export interface FridgeItem {
  id: number;
  name: string;
  quantity: number;
}

export interface Fridge {
  id: number;
  name: string;
  items: FridgeItem[];
}

export interface AddFridgeItemRequest {
  name: string;
  quantity?: number;
}

export async function viewFridge(token: string): Promise<Fridge> {
  const response = await fetch(`${API_BASE_URL}/fridge/`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch fridge contents');
  }

  return await response.json();
}

export async function addFridgeItem(token: string, item: AddFridgeItemRequest): Promise<FridgeItem> {
  const response = await fetch(`${API_BASE_URL}/fridge/add/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add item to fridge');
  }

  return await response.json();
}

export async function removeFridgeItem(token: string, itemId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/fridge/item/${itemId}/remove/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove item from fridge');
  }
}

export async function clearFridge(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/fridge/clear/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to clear fridge');
  }
}