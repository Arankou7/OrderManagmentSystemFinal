import React, { useState } from 'react';

const ProductImages = ({ productName }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const views = ['Main', 'Side', 'Detail', 'Scale'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
                position: 'relative'
            }}>
                <div style={{
                    width: '72%',
                    aspectRatio: '1 / 1',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--color-primary)',
                    fontSize: '2rem',
                    fontWeight: '700'
                }}>
                    {productName || 'Product'}
                </div>
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: 'var(--color-action)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    {selectedImage + 1}/{views.length}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem'
            }}>
                {views.map((view, index) => (
                    <div
                        key={view}
                        onClick={() => setSelectedImage(index)}
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            borderRadius: '6px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary)',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            border: selectedImage === index
                                ? '3px solid var(--color-action)'
                                : '1px solid var(--color-border)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedImage !== index) {
                                e.currentTarget.style.borderColor = 'var(--color-action)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedImage !== index) {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                            }
                        }}
                    >
                        {view}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductImages;
