import React from 'react';

const PageHeader = ({ title, subtitle }) => {
    return (
        <div style={{ textAlign: 'center', padding: '2rem 0', marginBottom: '2rem' }}>
            <h1 style={{ 
                color: 'var(--color-primary)', 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                marginBottom: '1rem' 
            }}>
                {title}
            </h1>
            {subtitle && (
                <p style={{ 
                    color: 'var(--color-text-light)', 
                    fontSize: '1.1rem' 
                }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageHeader;
