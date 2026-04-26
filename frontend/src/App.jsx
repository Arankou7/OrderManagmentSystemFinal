import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import keycloak from "./Keycloak";
import { CartProvider } from "./context/CartContext";
import { ToastContainer } from 'react-toastify';
import Orders from "./pages/Orders";
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Pages
import RootLayout from "./main/RootLayout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail/ProductDetail";

const Profile = () => <h2>User Profile 👤</h2>;

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "cart", element: <Cart /> },
        { path: "checkout", element: <Checkout /> },
        { path: "product/:productId", element: <ProductDetail /> },
        { path: "orders", element: <Orders /> },
        { path: "profile", element: <Profile /> },
      ],
    },
    {
      path: "/signin",
      element: <Navigate to="/" replace />
    },
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ]);

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