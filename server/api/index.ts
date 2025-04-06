import { Router } from 'express';
import categoriesRouter from './categories';
import productsRouter from './products';
import cartRouter from './cart';
import vehiclesRouter from './vehicles';

const router = Router();

router.use('/categories', categoriesRouter);
router.use('/products', productsRouter);
router.use('/cart', cartRouter);
router.use('/vehicles', vehiclesRouter);

export default router;