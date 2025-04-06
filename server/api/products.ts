import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertProductSchema } from '@shared/schema';

const router = Router();

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await storage.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

// Get product by id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    const product = await storage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

// Get products by category ID
router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const categoryId = Number(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const products = await storage.getProductsByCategory(categoryId);
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

// Create a new product (for admin use)
router.post('/', async (req, res, next) => {
  try {
    const parseResult = insertProductSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }
    
    const newProduct = await storage.createProduct(parseResult.data);
    return res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// Update a product (full update)
router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Check if product exists
    const existingProduct = await storage.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const parseResult = insertProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }
    
    const updatedProduct = await storage.updateProduct(id, parseResult.data);
    return res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

// Update a product's image or other individual fields (partial update)
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Check if product exists
    const existingProduct = await storage.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Schema for image update
    const imageUpdateSchema = z.object({
      image: z.string().url()
    });
    
    const parseResult = imageUpdateSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }
    
    // For now we only support updating the image field
    if (req.body.image) {
      const updatedProduct = await storage.updateProductImage(id, req.body.image);
      return res.status(200).json(updatedProduct);
    } else {
      return res.status(400).json({ error: 'No valid fields to update provided' });
    }
  } catch (error) {
    next(error);
  }
});

// Delete a product
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Check if product exists
    const existingProduct = await storage.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await storage.deleteProduct(id);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;