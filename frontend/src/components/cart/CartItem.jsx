import React, { useState } from 'react';

const CartItem = ({ id, name, price, quantity, image, onQuantityChange, onRemove }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityChange = async (newQuantity) => {
        setIsUpdating(true);
        try {
            await onQuantityChange(id, newQuantity);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsUpdating(true);
        try {
            await onRemove(id);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <article className={`card border-0 shadow-sm mb-3 ${isUpdating ? 'opacity-75 pe-none' : ''}`}>
            <div className="card-body">
                <div className="row g-3 align-items-center">
                    <div className="col-auto">
                        <div
                            className="rounded d-flex align-items-center justify-content-center overflow-hidden fw-bold"
                            style={{
                                width: '96px',
                                height: '96px',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-primary)',
                                fontSize: '1.4rem',
                            }}
                        >
                            {image ? (
                                <img src={image} alt={name} className="w-100 h-100 object-fit-cover" />
                            ) : (
                                <span>{name?.charAt(0)?.toUpperCase() || 'P'}</span>
                            )}
                        </div>
                    </div>

                    <div className="col-12 col-sm">
                        <h3 className="h5 fw-bold mb-1" style={{ color: 'var(--color-primary)' }}>{name}</h3>
                        <p className="mb-0" style={{ color: 'var(--color-text-light)' }}>
                            ${price.toFixed(2)} each
                        </p>
                    </div>

                    <div className="col-auto">
                        <div className="btn-group" role="group" aria-label={`Change quantity for ${name}`}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary fw-bold"
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={isUpdating}
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <span className="btn btn-outline-secondary disabled fw-bold" style={{ minWidth: '48px' }}>
                                {quantity}
                            </span>
                            <button
                                type="button"
                                className="btn btn-outline-secondary fw-bold"
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={isUpdating}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="col-6 col-sm-auto text-sm-end">
                        <span className="small d-block" style={{ color: 'var(--color-text-light)' }}>Total</span>
                        <strong className="h5 mb-0" style={{ color: 'var(--color-action)' }}>
                            ${(price * quantity).toFixed(2)}
                        </strong>
                    </div>

                    <div className="col-6 col-sm-auto text-end">
                        <button
                            type="button"
                            className="btn btn-outline-danger fw-bold"
                            onClick={handleRemove}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Remove'}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default CartItem;
