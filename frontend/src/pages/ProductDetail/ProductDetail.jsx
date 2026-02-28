import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../api/productApi';
import ProductImages from './components/ProductImages';
import ProductInfo from './components/ProductInfo';
import ProductCharacteristics from './components/ProductCharacteristics';
import ProductReviews from './components/ProductReviews';
import RelatedProducts from './components/RelatedProducts';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts.getAllProducts();
                console.log('All products:', data);
                console.log('Looking for productId:', productId);
                
                const foundProduct = data.find(p => p.id === productId || p.id.toString() === productId);
                
                if (!foundProduct) {
                    console.warn('Product not found for ID:', productId);
                    setError('Product not found');
                    return;
                }
                
                console.log('Found product:', foundProduct);
                setProduct(foundProduct);
                setError(null);
            } catch (err) {
                console.error('Error loading product:', err);
                setError(err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            loadProduct();
        }
    }, [productId]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.5rem',
                color: 'var(--color-text-light)'
            }}>
                Loading product details...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center'
            }}>
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
                        fontWeight: '600'
                    }}
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'var(--color-bg)',
            minHeight: '100vh',
            paddingBottom: '3rem'
        }}>
            {/* Back Button & Breadcrumb */}
            <div style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--color-action)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        fontWeight: '600'
                    }}
                >
                    ← Back
                </button>
                <span style={{ color: 'var(--color-text-light)' }}>
                    / {product.category} / {product.name}
                </span>
            </div>

            {/* Main Content */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '2rem'
            }}>
                {/* Product Detail Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3rem',
                    marginBottom: '4rem'
                }}>
                    {/* Images Column */}
                    <div>
                        <ProductImages productName={product.name} />
                    </div>

                    {/* Info Column */}
                    <div>
                        <ProductInfo product={product} />
                    </div>
                </div>

                {/* Characteristics Section */}
                <div style={{
                    marginBottom: '4rem'
                }}>
                    <ProductCharacteristics product={product} />
                </div>

                {/* Reviews Section */}
                <div style={{
                    marginBottom: '4rem'
                }}>
                    <ProductReviews />
                </div>

                {/* Related Products Section */}
                <div>
                    <RelatedProducts 
                        currentProductId={product.id} 
                        category={product.category}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
