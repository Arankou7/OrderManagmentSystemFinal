import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import keycloak from "./Keycloak";

// Layouts & Pages
import RootLayout from "./main/RootLayout";
import Home from "./pages/Home";

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

  return <RouterProvider router={router} />;
}

export default App;