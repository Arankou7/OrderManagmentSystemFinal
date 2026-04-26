/**
 * Toast notification system
 * Usage: toast.error('Error message'), toast.success('Success message'), toast.info('Info message')
 */

const TOAST_DURATION = 4000; // 4 seconds
let toastCounter = 0;

// Create a container for toasts if it doesn't exist
const createToastContainer = () => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    return container;
};

const showToast = (message, type = 'info') => {
    const container = createToastContainer();
    const toastId = toastCounter++;
    
    const toast = document.createElement('div');
    toast.id = `toast-${toastId}`;
    
    // Determine colors based on type
    const bgColor = {
        error: '#ef4444',
        success: '#10b981',
        info: '#3b82f6',
        warning: '#f59e0b'
    }[type] || '#3b82f6';
    
    const textColor = '#ffffff';
    
    toast.style.cssText = `
        background-color: ${bgColor};
        color: ${textColor};
        padding: 1rem 1.5rem;
        border-radius: 6px;
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
        pointer-events: auto;
        font-weight: 500;
        font-size: 0.95rem;
        animation: slideIn 0.3s ease-out forwards;
        max-width: 400px;
        word-wrap: break-word;
        white-space: pre-wrap;
        overflow-wrap: break-word;
    `;
    
    toast.textContent = message;
    
    // Add animation styles to document if not already present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, TOAST_DURATION);
};

export const toast = {
    error: (message) => showToast(message, 'error'),
    success: (message) => showToast(message, 'success'),
    info: (message) => showToast(message, 'info'),
    warning: (message) => showToast(message, 'warning')
};
