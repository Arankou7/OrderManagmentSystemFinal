import { useState } from 'react';
import { Link } from 'react-router-dom';
import { canPurchaseProduct } from '../../utils/products';
import { formatCurrency } from '../../utils/format';

export default function ProductCard({ product, onAddToCart }) {
  const [adding, setAdding] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const available = canPurchaseProduct(product, product.inventory);
  const stockKnown = Number.isFinite(product.inventory?.availableQuantity);
  const stockLabel = !product.inventoryLoaded
    ? 'Checking stock...'
    : !stockKnown
      ? 'Stock unavailable'
      : available
        ? `${product.inventory.availableQuantity} available`
        : 'Out of stock';
  async function add() {
    if (adding || !available) return;
    setAdding(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setAdding(false);
    }
  }
  return (
    <article className="product-card">
      <Link
        className="product-image"
        to={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
      >
        {product.imageUrls?.[0] && !imageFailed ? (
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="image-placeholder">{product.name?.charAt(0)?.toUpperCase() || 'P'}</span>
        )}
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category || 'Catalogue'}</span>
        <h2>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h2>
        <p className="product-description">
          {product.description || 'View product details and specifications.'}
        </p>
        <span className={`stock-label ${available ? 'in-stock' : ''}`}>{stockLabel}</span>
        <div className="product-card-actions">
          <strong>{formatCurrency(product.price)}</strong>
          <button
            className="btn btn-primary"
            disabled={!available || adding}
            onClick={add}
          >
            {adding ? 'Adding...' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
