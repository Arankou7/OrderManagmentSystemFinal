import React, { useState } from 'react';

const ProductImages = ({ productName }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    
    // Placeholder images - in a real app, these would come from product data
    const images = [
        '📦',
        '📦',
        '📦',
        '📦'
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Main Image Display */}
            <div style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8rem',
                border: '1px solid var(--color-border)',
                position: 'relative'
            }}>
                {images[selectedImage]}
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
                    1/{images.length}
                </div>
            </div>

            {/* Thumbnail Images */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem'
            }}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            borderRadius: '6px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
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
                        {image}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductImages;
