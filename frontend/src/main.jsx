import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./Keycloak";
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));

keycloak.init({ 
    onLoad: 'check-sso',  // 👈 Change 1: Check silently first
    checkLoginIframe: false 
}).then((authenticated) => {
    
    if (!authenticated) {
        // 👈 Change 2: If not logged in, force redirect to Home ('/')
        console.log("Not authenticated, redirecting to login...");
        keycloak.login({ redirectUri: 'http://localhost:5173/' });
    } else {
        // If logged in, render the app
        console.log("Authenticated!");
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }

}).catch((e) => {
    console.error("Keycloak Init Failed", e);
});