# Order System frontend

React interface for the existing order-management services. Backend routes and business rules are unchanged by the presentation cleanup.

## Run

From this directory:

```sh
npm run dev
npm run lint
npm run build
npm run format
npm run format:check
```

Start Keycloak and the local Spring Boot services before signing in. The default frontend URL is http://localhost:5173, Keycloak is http://localhost:8180, and the API gateway is http://localhost:8080/api. Existing `VITE_*` environment overrides still apply.

## Where to find things

| Folder                     | Purpose                                                     |
| -------------------------- | ----------------------------------------------------------- |
| `src/pages/catalogue`      | Storefront search, category filters and sorting             |
| `src/pages/ProductDetail`  | Product details, images, specifications and recommendations |
| `src/pages/cart`           | Shopping cart page                                          |
| `src/pages/checkout`       | Order review and confirmation                               |
| `src/pages/orders`         | Customer order history                                      |
| `src/pages/admin`          | Administration dashboard                                    |
| `src/components/catalogue` | Product cards and grid                                      |
| `src/components/cart`      | Cart rows, list and summary                                 |
| `src/components/admin`     | Category templates and order workflow                       |
| `src/components/common`    | Shared page header                                          |
| `src/components/auth`      | Admin route guard                                           |
| `src/layouts`              | Navigation, page shell and footer                           |
| `src/auth`                 | Keycloak configuration                                      |
| `src/api`                  | Existing service API calls                                  |
| `src/context`              | Shared cart state                                           |
| `src/utils`                | Toasts, currency formatting and product visibility rules    |
| `src/index.css`            | Theme, shared styling and responsive layout                 |

## Presentation checklist

1. Sign in and show the catalogue, search, category filtering and price sorting.
2. Open a product and show its images, specifications and recommendations.
3. Add an item, change its quantity in the cart, and review the checkout total.
4. Place a demo order only when ready to create a real order record and trigger the existing backend workflow.
5. Open My orders and show status tracking.
6. Open Admin panel and show inventory, category templates and order workflow.
7. For a visibility demonstration, set a demo product to INACTIVE, return to the catalogue, and confirm it is hidden. Restore its original status afterwards.
8. Check the layout at a narrow window width and use Tab to navigate controls.

Inactive products are hidden from the storefront and direct product views. OUT_OF_STOCK listings remain visible but cannot be added to the cart. Unknown stock also disables purchasing. These frontend checks do not replace backend validation.

No unit tests were added. Use lint, the production build and the live demo checks above for this presentation pass.

## Validation from this cleanup

- ESLint and the production build passed.
- Live browser checks: sign-in, catalogue loading, search with no results, reset filters, category filtering, product details, add to cart, quantity increase, checkout totals, remove from cart, admin catalogue, order history and direct confirmation-page redirect.
- Desktop and narrow catalogue layouts were inspected; the narrow layout had no horizontal page overflow.
- The temporary cart item was removed after verification. No order was submitted and product statuses were not changed. All six products in the current demo data were ACTIVE, so the inactive-product rule still needs the manual status-toggle check above if you want to demonstrate it.
