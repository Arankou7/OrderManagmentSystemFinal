import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./Keycloak";
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));

keycloak.init({ 
    onLoad: 'check-sso',
    checkLoginIframe: false 
}).then((authenticated) => {
    
    if (!authenticated) {
        console.log("Not authenticated, redirecting to login...");
        keycloak.login({ redirectUri: 'http://localhost:5173/' });
    } else {
        console.log("Authenticated!");
        
        // Store tokens in localStorage for API calls
        if (keycloak.token) {
            localStorage.setItem('access_token', keycloak.token);
        }
        if (keycloak.refreshToken) {
            localStorage.setItem('refresh_token', keycloak.refreshToken);
        }
        
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }

}).catch((e) => {
    console.error("Keycloak Init Failed", e);
});