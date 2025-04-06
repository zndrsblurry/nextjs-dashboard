import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCartItemSchema } from '@shared/schema';

const router = Router();

// Schema for adding/updating cart items
const cartActionSchema = z.object({
  userId: z.number({ 
    required_error: "userId is required", 
    invalid_type_error: "userId must be a number"
  }),
  productId: z.number({
    required_error: "productId is required",
    invalid_type_error: "productId must be a number"
  }),
  quantity: z.number({
    required_error: "quantity is required",
    invalid_type_error: "quantity must be a number"
  }).positive("quantity must be a positive number").default(1)
});

// Get cart items with product details for a user
router.get('/:userId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const cartItems = await storage.getCartItemWithDetails(userId);
    return res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/', async (req, res, next) => {
  try {
    const parseResult = cartActionSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: parseResult.error.format() 
      });
    }
    
    const { userId, productId, quantity } = parseResult.data;
    
    // Check if product exists
    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const cartItem = await storage.addToCart({
      userId,
      productId,
      quantity
    });
    
    return res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/', async (req, res, next) => {
  try {
    const parseResult = cartActionSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: parseResult.error.format() 
      });
    }
    
    const { userId, productId, quantity } = parseResult.data;
    
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      await storage.removeFromCart(userId, productId);
      return res.status(200).json({ message: 'Item removed from cart' });
    }
    
    const cartItem = await storage.updateCartItemQuantity(userId, productId, quantity);
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    return res.status(200).json(cartItem);
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/:userId/:productId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);
    
    if (isNaN(userId) || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid user ID or product ID' });
    }
    
    await storage.removeFromCart(userId, productId);
    return res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/:userId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    await storage.clearCart(userId);
    return res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
});

export default router;