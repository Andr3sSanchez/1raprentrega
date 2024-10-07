import fs from 'fs/promises';
import path from 'path';

const cartsFilePath = path.resolve('data', 'carts.json');

export default class CartManager {
    constructor() {
    this.carts = [];
    this.init();
    }

    async init() {
    try {
        const data = await fs.readFile(cartsFilePath, 'utf-8');
        this.carts = JSON.parse(data);
    } catch (error) {
        this.carts = [];
        await this.saveToFile();
    }
    }

    async saveToFile() {
    try {
        await fs.writeFile(cartsFilePath, JSON.stringify(this.carts, null, 2));
    } catch (error) {
        console.error('Error al guardar los carritos:', error);
    }
    }

    getCartById(id) {
    return this.carts.find(cart => cart.id === id);
    }

    async createCart() {
    const newCart = {
        id: this.carts.length ? this.carts[this.carts.length - 1].id + 1 : 1,
        products: []
    };
    this.carts.push(newCart);
    await this.saveToFile();
    return newCart;
    }

    async addProductToCart(cartId, productId) {
    const cart = this.getCartById(cartId);
    if (!cart) return null;


    const productInCart = cart.products.find(p => p.productId === productId);
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({ productId, quantity: 1 });
    }

    await this.saveToFile();
    return cart;
    }

    getAllCarts() {
    return this.carts;
    }
}
