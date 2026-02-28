import React, { useState, useContext,useEffect } from 'react';
import PageHeader from '../components/card/PageHeader';
import ProductGrid from '../components/card/ProductGrid';
import { CartContext } from '../context/CartContext';
import { fetchProducts } from '../api/productApi';
const Home = () => {
    const { addToCart } = useContext(CartContext);
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts.getAllProducts();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const handleAddToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            addToCart(product);
            console.log(`Added ${product.name} to cart`);
        }
    };

    return (
        <>
            <PageHeader 
                title="Welcome to Our Store! 🏠"
                subtitle="Browse our amazing collection of products"
            />
            <ProductGrid 
                products={products}
                onAddToCart={handleAddToCart}
            />
        </>
    );
};

export default Home;