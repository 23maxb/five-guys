// src/lib/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// Real login function using Django backend
export async function login({ email, password }: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return await response.json();
}

// Register function
export async function register({ email, password, name }: RegisterRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return await response.json();
}

// Get user profile
export async function getUserProfile(token: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/profile/`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return await response.json();
}

// Logout function
export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/logout/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
}
