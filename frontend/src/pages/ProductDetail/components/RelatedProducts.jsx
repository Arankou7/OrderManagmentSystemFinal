import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../../api/productApi';

const RelatedProducts = ({ currentProductId, category }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadRelatedProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts.getAllProducts();
                // Filter out current product and show related ones
                const filtered = data
                    .filter(p => p.id !== currentProductId)
                    .slice(0, 4);
                setRelatedProducts(filtered);
            } catch (err) {
                console.error('Error loading related products:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRelatedProducts();
    }, [currentProductId]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--color-primary)'
            }}>
                Related Products
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                {relatedProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        style={{
                            backgroundColor: 'var(--color-card)',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            backgroundColor: 'var(--color-bg)',
                            height: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem'
                        }}>
                            📦
                        </div>
                        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                color: 'var(--color-primary)',
                                marginBottom: '0.5rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {product.name}
                            </h4>
                            <p style={{
                                color: 'var(--color-text-light)',
                                fontSize: '0.85rem',
                                marginBottom: '1rem',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {product.description}
                            </p>
                            <span style={{
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                color: 'var(--color-action)'
                            }}>
                                ${product.price}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
