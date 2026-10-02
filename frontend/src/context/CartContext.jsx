import React, { useRef, useState, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeCartItem } from '../api/cartApi';
import { toast } from '../utils/toast';
import { CartContext } from './cartContextValue';

const mapCartItems = (cartData) =>
  (Array.isArray(cartData) ? cartData : cartData?.items || []).map((item) => ({
    id: item.skuCode,
    skuCode: item.skuCode,
    name: item.productName,
    price: Number(item.price),
    quantity: Number(item.quantity),
    image: item.image || null,
  }));

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [error, setError] = useState(null);
  const loadCartRequestRef = useRef(null);

  /**
   * Load the cart from the backend
   */
  const loadCart = useCallback(async () => {
    if (loadCartRequestRef.current) {
      return loadCartRequestRef.current;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token - user may not be authenticated');
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      loadCartRequestRef.current = getCart();
      const cartData = await loadCartRequestRef.current;
      setCartItems(mapCartItems(cartData));
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError(err.message);
      toast.error('Failed to load cart. Please refresh the page.');
    } finally {
      loadCartRequestRef.current = null;
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a product to cart via backend API
   */
  const addToCart = useCallback(async (product, quantity = 1) => {
    setPendingChanges((count) => count + 1);
    try {
      setError(null);

      // Prepare the payload according to backend requirements
      const payload = {
        skuCode: product.skuCode || product.id,
        quantity,
        price: product.price,
        productName: product.name || product.productName,
      };

      // Call backend API
      const updatedCart = await apiAddToCart(payload);
      setCartItems(mapCartItems(updatedCart));
      toast.success(`${product.name || product.productName} added to cart!`);
      return true;
    } catch (err) {
      console.error('Failed to add item to cart:', err);

      // Check if it's a stock allocation error
      if (err.response?.status === 400 || err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || 'Not enough stock available';
        toast.error(`Sorry, ${errorMessage}`);
      } else {
        toast.error('Failed to add item to cart. Please try again.');
      }

      setError(err.message);
      return false;
    } finally {
      setPendingChanges((count) => count - 1);
    }
  }, []);

  /**
   * Remove an item from cart
   */
  const removeFromCart = useCallback(async (productId) => {
    setPendingChanges((count) => count + 1);
    try {
      setError(null);

      // Call backend API to remove item
      await removeCartItem(productId);

      // Update local state - remove the item
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      toast.error('Failed to remove item. Please try again.');
      setError(err.message);
      return false;
    } finally {
      setPendingChanges((count) => count - 1);
    }
  }, []);

  /**
   * Update quantity of an item in the cart
   */
  const updateQuantity = useCallback(
    async (productId, newQuantity) => {
      // If quantity reaches 0, remove the item instead
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      setPendingChanges((count) => count + 1);
      try {
        setError(null);

        // Call backend API to update quantity
        await updateCartItem(productId, newQuantity);

        // Update local state with new quantity
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item,
          ),
        );
        toast.success('Cart updated');
      } catch (err) {
        console.error('Failed to update cart item:', err);

        // Check if it's a stock allocation error
        if (err.response?.status === 400 || err.response?.status === 500) {
          const errorMessage =
            err.response?.data?.message || 'Not enough stock available for this quantity';
          toast.error(`Sorry, ${errorMessage}`);
        } else {
          toast.error('Failed to update quantity. Please try again.');
        }

        setError(err.message);

        // Reload cart from backend to ensure local state matches backend
        await loadCart();
      } finally {
        setPendingChanges((count) => count - 1);
      }
    },
    [removeFromCart, loadCart],
  );

  /**
   * Clear the entire cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    setError(null);
  }, []);

  /**
   * Get total number of items in cart
   */
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        isMutating: pendingChanges > 0,
        error,
        loadCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
