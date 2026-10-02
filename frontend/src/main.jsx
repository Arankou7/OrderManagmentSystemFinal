import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './auth/keycloak';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

keycloak
  .init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (!authenticated) {
      console.log('Not authenticated, redirecting to login...');
      keycloak.login({ redirectUri: window.location.href });
    } else {
      console.log('Authenticated!');

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
        </React.StrictMode>,
      );
    }
  })
  .catch((e) => {
    console.error('Keycloak Init Failed', e);
    root.render(
      <main className="state-panel">
        <h1 className="h4">Sign-in is temporarily unavailable</h1>
        <p>Please check that the authentication service is running and try again.</p>
        <button
          className="btn btn-dark"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </main>,
    );
  });
