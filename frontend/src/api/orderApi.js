import api from './axiosConfig';

/**
 * Creates an order from the current cart
 * POST /api/order
 * 
 * The backend automatically:
 * - Fetches the cart for the authenticated user
 * - Confirms the stock reservation
 * - Creates the order with cart items
 * - Clears the cart
 * - Returns the order response
 * 
 * @returns {Promise<object>} The order confirmation with orderNumber and status
 * @throws {Error} If the request fails
 */
export const createOrder = async () => {
    try {
        // Simply POST to /order with no body - JWT token is in Authorization header
        // The backend extracts user info from the token and retrieves their cart
        const response = await api.post('/order', {});
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        console.error('Order API error response:', error.response?.data);
        console.error('Order API error status:', error.response?.status);
        throw error;
    }
};
