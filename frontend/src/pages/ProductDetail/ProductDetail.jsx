import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../api/productApi';
import { isVisibleProduct } from '../../utils/products';
import ProductImages from './components/ProductImages';
import ProductInfo from './components/ProductInfo';
import ProductCharacteristics from './components/ProductCharacteristics';
import RelatedProducts from './components/RelatedProducts';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const foundProduct = await fetchProducts.getProductById(productId, { force: true });

        if (!active) return;
        if (!isVisibleProduct(foundProduct)) {
          console.warn('Product not found for ID:', productId);
          setError('Product not found');
          return;
        }
        setProduct(foundProduct);
        setError(null);
      } catch (err) {
        console.error('Error loading product:', err);
        if (!active) return;
        setError(err.message || 'Failed to load product');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
    return () => {
      active = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '40vh',
          fontSize: '1.5rem',
          color: 'var(--color-text-light)',
        }}
      >
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
          {error || 'Product not found'}
        </h2>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: 'var(--color-action)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        minHeight: '100vh',
        paddingBottom: '3rem',
      }}
    >
      {/* Back Button & Breadcrumb */}
      <div
        style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-action)',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: '600',
          }}
        >
          Back
        </button>
        <span style={{ color: 'var(--color-text-light)' }}>
          / {product.category} / {product.name}
        </span>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        {/* Product Detail Grid */}
        <div className="product-detail-grid">
          {/* Images Column */}
          <div>
            <ProductImages
              key={product.id}
              productName={product.name}
              imageUrls={product.imageUrls || []}
            />
          </div>

          {/* Info Column */}
          <div>
            <ProductInfo
              key={product.id}
              product={product}
            />
          </div>
        </div>

        {/* Characteristics Section */}
        <div
          style={{
            marginBottom: '4rem',
          }}
        >
          <ProductCharacteristics product={product} />
        </div>

        {/* Related Products Section */}
        <div>
          <RelatedProducts currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
