import React, { useState } from 'react';

const ProductImages = ({ productName, imageUrls = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const hasImages = imageUrls.length > 0;
  const selectedUrl = imageUrls[selectedImage];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg)',
          borderRadius: '8px',
          height: 'clamp(260px, 45vw, 500px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        {hasImages ? (
          <img
            src={selectedUrl}
            alt={`${productName} ${selectedImage + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
          />
        ) : (
          <div
            style={{
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
              fontWeight: '700',
            }}
          >
            {productName || 'Product'}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'var(--color-action)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          {hasImages ? `${selectedImage + 1}/${imageUrls.length}` : 'No image'}
        </div>
      </div>

      {hasImages && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {imageUrls.map((url, index) => (
            <button
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-pressed={selectedImage === index}
              key={`${url}-${index}`}
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
                border:
                  selectedImage === index
                    ? '3px solid var(--color-action)'
                    : '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
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
              <img
                src={url}
                alt={`${productName} thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-card)',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
