import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import keycloak from "./Keycloak";
import { CartProvider } from "./context/CartContext";

// Layouts & Pages
import RootLayout from "./main/RootLayout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail/ProductDetail";

// Placeholders
const Reservation = () => <h2>Reservation Page 📅</h2>;
const Profile = () => <h2>User Profile 👤</h2>;

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "cart", element: <Cart /> },
        { path: "product/:productId", element: <ProductDetail /> },
        { path: "reservation", element: <Reservation /> },
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
    </CartProvider>
  );
}

export default App;