import api from './axiosConfig';

/**
 * Loads the user's entire shopping cart from the backend.
 * GET /api/cart
 * 
 * @returns {Promise<object>} The cart data from the server.
 * @throws {Error} If the request fails
 */
export const getCart = async () => {
    try {
        const response = await api.get('/cart');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

/**
 * Adds a new item to the shopping cart.
 * POST /api/cart/add
 * 
 * Payload must match: {skuCode, quantity, price, productName}
 * 
 * @param {object} item - The item to add.
 * @param {string} item.skuCode - The SKU of the product.
 * @param {number} item.quantity - The quantity to add.
 * @param {number} item.price - The price of the product.
 * @param {string} item.productName - The name of the product.
 * @returns {Promise<object>} The server's response.
 * @throws {Error} If the request fails (including stock allocation failures - 400/500)
 */
export const addToCart = async (item) => {
    try {
        // Validate required fields
        if (!item.skuCode || item.quantity === undefined || item.price === undefined || !item.productName) {
            throw new Error('Missing required fields: skuCode, quantity, price, productName');
        }

        const response = await api.post('/cart/add', {
            skuCode: item.skuCode,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName
        });
        return response.data;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
};

/**
 * Updates the quantity of an existing item in the cart.
 * PUT /api/cart/item/{skuCode}?quantity={newQuantity}
 * 
 * Note: If quantity reaches 0, the backend automatically deletes the item.
 * 
 * @param {string} skuCode - The SKU of the item to update.
 * @param {number} quantity - The new quantity.
 * @returns {Promise<object>} The server's response.
 * @throws {Error} If the request fails (including stock allocation failures - 400/500)
 */
export const updateCartItem = async (skuCode, quantity) => {
    try {
        if (!skuCode || quantity === undefined) {
            throw new Error('Missing required fields: skuCode and quantity');
        }

        const response = await api.put(`/cart/item/${skuCode}?quantity=${quantity}`);
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

/**
 * Removes an item from the shopping cart.
 * DELETE /api/cart/item/{skuCode}
 * 
 * @param {string} skuCode - The SKU of the item to remove.
 * @returns {Promise<object>} The server's response.
 * @throws {Error} If the request fails
 */
export const removeCartItem = async (skuCode) => {
    try {
        if (!skuCode) {
            throw new Error('Missing required field: skuCode');
        }

        const response = await api.delete(`/cart/item/${skuCode}`);
        return response.data;
    } catch (error) {
        console.error('Error removing cart item:', error);
        throw error;
    }
};
