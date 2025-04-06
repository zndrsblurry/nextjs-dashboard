import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCategorySchema } from '@shared/schema';

const router = Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await storage.getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

// Get category by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await storage.getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    return res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

// Create a new category (for admin use)
router.post('/', async (req, res, next) => {
  try {
    const parseResult = insertCategorySchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error });
    }
    
    const newCategory = await storage.createCategory(parseResult.data);
    return res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

export default router;