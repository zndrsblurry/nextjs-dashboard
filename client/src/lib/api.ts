import { Category, Product, CartItem } from "@shared/schema";

const API_BASE_URL = '/api';

// Category API functions
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/${slug}`, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to fetch category: ${slug}`);
  return response.json();
}

// Product API functions
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to fetch product: ${id}`);
  return response.json();
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`, { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to fetch products for category: ${categoryId}`);
  return response.json();
}

// Cart API functions
export async function getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch cart items');
  return response.json();
}

export async function addToCart(userId: number, productId: number, quantity: number = 1): Promise<CartItem> {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    body: JSON.stringify({ userId, productId, quantity }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to add item to cart');
  return response.json();
}

export async function updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<CartItem> {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'PUT',
    body: JSON.stringify({ userId, productId, quantity }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to update cart item');
  return response.json();
}

export async function removeFromCart(userId: number, productId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}/${productId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove item from cart');
  return;
}

export async function clearCart(userId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to clear cart');
  return;
}