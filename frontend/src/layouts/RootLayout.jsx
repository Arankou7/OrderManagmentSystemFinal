import { useContext, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import keycloak from '../auth/keycloak';
import { CartContext } from '../context/cartContextValue';

export default function RootLayout() {
  const { getTotalItems, loadCart } = useContext(CartContext);
  const { pathname } = useLocation();
  useEffect(() => {
    loadCart();
  }, [loadCart]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const logout = () => keycloak.logout({ redirectUri: window.location.origin });
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link
            className="brand"
            to="/"
          >
            <span
              className="brand-mark"
              aria-hidden="true"
            >
              O
            </span>
            <span>
              Order System<small>Browse. Order. Track.</small>
            </span>
          </Link>
          <nav
            className="main-nav"
            aria-label="Main navigation"
          >
            <NavLink
              to="/"
              end
            >
              Catalogue
            </NavLink>
            <NavLink to="/orders">My orders</NavLink>
            <NavLink to="/cart">
              Cart <span className="cart-count">{getTotalItems()}</span>
            </NavLink>
            {(keycloak.hasRealmRole('ADMIN') || keycloak.hasResourceRole('ADMIN')) && (
              <NavLink to="/admin">Admin panel</NavLink>
            )}
          </nav>
          <button
            onClick={logout}
            className="btn btn-outline-light btn-sm"
          >
            Sign out
          </button>
        </div>
      </header>
      <main
        id="main-content"
        className="container main-content"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>Order System</span>
        <span>Your catalogue, cart and orders in one place.</span>
      </footer>
    </div>
  );
}
