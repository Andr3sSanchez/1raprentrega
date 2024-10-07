import { Router } from 'express';
import CartManager from '../services/CartManager.js';
import ProductManager from '../services/ProductManager.js';

const router = Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

// Ruta raíz POST /
router.post('/', async (req, res) => {
    try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
    } catch (error) {
    console.error('Error al crear el carrito:', error);
    res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    try {
    const cartId = parseInt(req.params.cid);
    if (isNaN(cartId)) {
        return res.status(400).json({ error: 'ID de carrito no válido' });
    }

    const cart = await cartManager.getCartById(cartId);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }


    const detailedProducts = await Promise.all(
        cart.products.map(async (product) => {
        const productInfo = await productManager.getProductById(product.productId);
        if (productInfo) {
            return {
            ...productInfo,
            quantity: product.quantity,
            };
        }
        return null;
        })
    );


    const filteredProducts = detailedProducts.filter(item => item !== null);

    res.json(filteredProducts);
    } catch (error) {
    console.error('Error al obtener los productos del carrito:', error);
    res.status(500).json({ error: 'Error al obtener los productos del carrito' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    if (isNaN(cartId) || isNaN(productId)) {
        return res.status(400).json({ error: 'ID de carrito o producto no válido' });
    }

    const productExists = await productManager.getProductById(productId);
    if (!productExists) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    if (updatedCart) {
        res.json(updatedCart);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
    } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});

export default router;
