import React, { useState, useContext, useEffect, useMemo } from 'react';
import PageHeader from '../components/card/PageHeader';
import ProductGrid from '../components/card/ProductGrid';
import { CartContext } from '../context/cartContextValue';
import { fetchProducts } from '../api/productApi';

const Home = () => {
    const { addToCart } = useContext(CartContext);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOrder, setSortOrder] = useState('default');

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts.getAllProducts();
                if (isMounted) {
                    setProducts(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleAddToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            addToCart(product);
        }
    };

    const categories = useMemo(
        () => ['All', ...new Set(products.map(p => p.category).filter(Boolean))],
        [products]
    );

    const filteredAndSortedProducts = useMemo(() => {
        return [...products]
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
            .sort((a, b) => {
                if (sortOrder === 'price-low') return a.price - b.price;
                if (sortOrder === 'price-high') return b.price - a.price;
                return 0;
            });
    }, [products, searchTerm, selectedCategory, sortOrder]);

    return (
        <>
            <PageHeader
                title="Welcome to Our Store!"
                subtitle="Browse our amazing collection of products"
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto', padding: '0 1rem' }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    backgroundColor: 'var(--color-card)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1 1 250px',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            outline: 'none',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)'
                        }}
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="default">Sort by: Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading store...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#d93025' }}>{error}</div>
                ) : filteredAndSortedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>No products found.</div>
                ) : (
                    <ProductGrid
                        products={filteredAndSortedProducts}
                        onAddToCart={handleAddToCart}
                    />
                )}
            </div>
        </>
    );
};

export default Home;
