import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import Orders from './pages/orders/Orders';
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Pages
import RootLayout from './layouts/RootLayout';
import Home from './pages/catalogue/Home';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import CheckoutSuccess from './pages/checkout/CheckoutSuccess';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/auth/AdminRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'checkout/success', element: <CheckoutSuccess /> },
      { path: 'product/:productId', element: <ProductDetail /> },
      { path: 'orders', element: <Orders /> },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: '/signin',
    element: (
      <Navigate
        to="/"
        replace
      />
    ),
  },
  {
    path: '*',
    element: (
      <Navigate
        to="/"
        replace
      />
    ),
  },
]);

function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </CartProvider>
  );
}

export default App;
