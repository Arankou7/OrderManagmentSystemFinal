import React, { useContext, useState, useEffect, useCallback } from 'react';
import { CartContext } from '../../../context/cartContextValue';
import { canPurchaseProduct } from '../../../utils/products';
import { formatCurrency } from '../../../utils/format';
import { fetchInventory } from '../../../api/inventoryApi';

const ProductInfo = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [inventoryCount, setInventoryCount] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const isOutOfStock =
    product?.status === 'OUT_OF_STOCK' || (inventoryCount !== null && inventoryCount <= 0);
  const canAddToCart =
    canPurchaseProduct(product, { availableQuantity: inventoryCount }) &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    !isAddingToCart &&
    !loadingInventory &&
    quantity <= inventoryCount;

  const handleAddToCart = async () => {
    if (!product || !canAddToCart) {
      return;
    }

    setIsAddingToCart(true);
    try {
      const succeeded = await addToCart(product, quantity);
      setAddedToCart(Boolean(succeeded));
      if (succeeded) await handleInventoryLeft();
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (value) => {
    const newQty = parseInt(value, 10);
    if (newQty > 0) {
      setAddedToCart(false);
      setQuantity(inventoryCount === null ? newQty : Math.max(1, Math.min(newQty, inventoryCount)));
    }
  };

  const handleInventoryLeft = useCallback(async () => {
    if (!product?.skuCode) {
      return;
    }

    setLoadingInventory(true);
    try {
      const data = await fetchInventory.getInventory(product.skuCode);
      setInventoryCount(data.availableQuantity);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryCount(null);
    } finally {
      setLoadingInventory(false);
    }
  }, [product?.skuCode]);

  useEffect(() => {
    handleInventoryLeft();
  }, [handleInventoryLeft]);

  useEffect(() => {
    if (inventoryCount !== null && quantity > inventoryCount) {
      setQuantity(Math.max(inventoryCount, 1));
    }
  }, [inventoryCount, quantity]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '0.5rem',
          }}
        >
          {product?.name}
        </h1>
        <p
          style={{
            color: 'var(--color-text-light)',
            fontSize: '1rem',
          }}
        >
          SKU: {product?.skuCode}
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-bg)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'var(--color-action)',
            }}
          >
            {formatCurrency(product?.price)}
          </span>
        </div>

        <div
          style={{
            color: inventoryCount < 10 ? 'var(--color-action)' : 'var(--color-success)',
            fontWeight: '600',
            marginBottom: '1rem',
            padding: inventoryCount < 10 ? '0.75rem' : '0',
            backgroundColor: inventoryCount < 10 ? 'rgba(111, 37, 24, 0.19)' : 'transparent',
            borderRadius: inventoryCount < 10 ? '6px' : '0',
            border: inventoryCount < 10 ? '2px solid var(--color-action)' : 'none',
            animation: 'none',
          }}
        >
          {loadingInventory ? (
            'Checking stock...'
          ) : isOutOfStock ? (
            'Out of stock'
          ) : inventoryCount === null ? (
            'Stock unavailable'
          ) : inventoryCount > 0 ? (
            inventoryCount < 10 ? (
              <>
                Hurry! Only <strong>{inventoryCount} left</strong> in stock.
              </>
            ) : (
              <>{inventoryCount} in stock</>
            )
          ) : (
            'Out of stock'
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <label
            htmlFor="product-quantity"
            style={{ color: 'var(--color-text-light)' }}
          >
            Quantity:
          </label>
          <input
            id="product-quantity"
            type="number"
            min="1"
            max={Math.max(1, inventoryCount ?? 100)}
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            disabled={isOutOfStock}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              width: '60px',
              textAlign: 'center',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-primary)',
              fontSize: '1rem',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        style={{
          backgroundColor: isOutOfStock
            ? 'var(--color-text-light)'
            : addedToCart
              ? 'var(--color-success)'
              : 'var(--color-action)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          border: 'none',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: canAddToCart ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          opacity: canAddToCart ? 1 : 0.75,
        }}
        onMouseEnter={(e) => {
          if (!addedToCart && canAddToCart) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {isOutOfStock
          ? 'Out of Stock'
          : isAddingToCart
            ? 'Adding...'
            : addedToCart
              ? 'Added to Cart'
              : 'Add to Cart'}
      </button>

      <div>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'var(--color-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Description
        </h3>
        <p
          style={{
            color: 'var(--color-text-light)',
            lineHeight: '1.6',
          }}
        >
          {product?.description}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
