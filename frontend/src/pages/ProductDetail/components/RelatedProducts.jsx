import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isVisibleProduct } from '../../../utils/products';
import { fetchProducts } from '../../../api/productApi';

const RelatedProducts = ({ currentProductId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRelatedProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts.getRelatedProducts(currentProductId);
        if (isMounted) setRecommendations(data.filter((item) => isVisibleProduct(item.product)));
      } catch (error) {
        console.error('Error loading related products:', error);
        if (isMounted) setRecommendations([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRelatedProducts();
    return () => {
      isMounted = false;
    };
  }, [currentProductId]);

  if (loading)
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Finding relevant products...</div>;
  if (recommendations.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '0.25rem',
          }}
        >
          Related Products
        </h2>
        <p style={{ color: 'var(--color-text-light)', margin: 0 }}>
          Chosen by category, specifications, name similarity, and price range.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {recommendations.map(({ product, relevanceScore, matchReasons }) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
              event.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.boxShadow = 'none';
              event.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              {product.imageUrls?.[0] ? (
                <img
                  src={product.imageUrls[0]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '📦'
              )}
            </div>
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: 'var(--color-primary)',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {product.name}
              </h4>
              <p
                style={{
                  color: 'var(--color-text-light)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {product.description}
              </p>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-action)' }}>
                ${product.price}
              </span>
              <small style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                {(matchReasons || []).join(' · ')} ({relevanceScore}% match)
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
