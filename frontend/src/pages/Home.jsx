import React from 'react';

const Home = () => {
    return (
        <div className="text-center" style={{ padding: '3rem 0' }}>
            <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>
                Welcome Home! 🏠
            </h1>
            <p className="lead" style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>
                Select an option from the menu.
            </p>
        </div>
    );
};

export default Home;