import React, { useState } from 'react';

const ProductReviews = () => {
    const [reviews] = useState([
        {
            id: 1,
            author: 'John Doe',
            rating: 5,
            date: '2024-01-15',
            title: 'Excellent Product!',
            comment: 'Amazing quality and fast delivery. Highly recommended!'
        },
        {
            id: 2,
            author: 'Jane Smith',
            rating: 4,
            date: '2024-01-10',
            title: 'Good Value for Money',
            comment: 'Great product, would have preferred faster shipping.'
        },
        {
            id: 3,
            author: 'Mike Johnson',
            rating: 5,
            date: '2024-01-05',
            title: 'Perfect!',
            comment: 'Exactly what I was looking for. Will buy again!'
        }
    ]);

    const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--color-primary)'
            }}>
                Customer Reviews
            </h2>

            {/* Rating Summary */}
            <div style={{
                backgroundColor: 'var(--color-bg)',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                textAlign: 'center'
            }}>
                <div>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: '700',
                        color: 'var(--color-action)',
                        marginBottom: '0.5rem'
                    }}>
                        {averageRating}
                    </div>
                    <div style={{ color: 'var(--color-action)', fontSize: '1.2rem' }}>
                        ⭐⭐⭐⭐⭐
                    </div>
                    <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                        Based on {reviews.length} reviews
                    </p>
                </div>

                <div>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                        Rating Distribution
                    </h3>
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = (count / reviews.length) * 100;
                        return (
                            <div key={rating} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ width: '30px' }}>{rating}★</span>
                                <div style={{
                                    flex: 1,
                                    backgroundColor: 'var(--color-border)',
                                    height: '8px',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        backgroundColor: 'var(--color-action)',
                                        height: '100%',
                                        width: `${percentage}%`,
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <span style={{ width: '30px', textAlign: 'right', color: 'var(--color-text-light)' }}>
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Individual Reviews */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)'
                }}>
                    Recent Reviews
                </h3>

                {reviews.map((review) => (
                    <div
                        key={review.id}
                        style={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            padding: '1.5rem'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '1rem'
                        }}>
                            <div>
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--color-primary)',
                                    marginBottom: '0.25rem'
                                }}>
                                    {review.title}
                                </h4>
                                <p style={{
                                    color: 'var(--color-text-light)',
                                    fontSize: '0.9rem'
                                }}>
                                    by {review.author}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    color: 'var(--color-action)',
                                    fontSize: '1rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    {'⭐'.repeat(review.rating)}
                                </div>
                                <p style={{
                                    color: 'var(--color-text-light)',
                                    fontSize: '0.85rem'
                                }}>
                                    {new Date(review.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <p style={{
                            color: 'var(--color-primary)',
                            lineHeight: '1.6'
                        }}>
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductReviews;
