# Cart Frontend Refactoring - Implementation Summary

## Overview
Your shopping cart frontend has been refactored to integrate with the new Spring Boot backend that supports real-time soft allocation through the API Gateway (http://localhost:8080). All API calls now include JWT token authentication and implement comprehensive error handling for stock allocation failures.

---

## Key Changes Made

### 1. ✅ Authentication (JWT Token Handling)
**Status**: Already Configured ✓

Your `axiosConfig.js` was already properly configured to handle JWT tokens:
- All API requests automatically include the `Authorization: Bearer <token>` header
- The token is read from `localStorage.getItem('access_token')`
- Includes token refresh logic for when tokens expire
- **No additional changes needed** - your setup is production-ready

---

### 2. 🔔 New Toast Notification System
**File**: `frontend/src/utils/toast.js` (NEW)

A frontend-agnostic toast notification system that displays temporary notifications to users:

```javascript
import { toast } from '../utils/toast';

// Usage examples:
toast.success('Item added to cart!')
toast.error('Sorry, not enough stock available for this quantity.')
toast.info('Cart updated')
toast.warning('Warning message')
```

**Features:**
- Auto-dismisses after 4 seconds
- Slide-in/slide-out animations
- Color-coded by type: error (red), success (green), info (blue), warning (orange)
- Fixed positioning at top-right of screen
- No external dependencies required

---

### 3. 🔄 Refactored CartContext.jsx
**File**: `frontend/src/context/CartContext.jsx`

**Major Changes:**
- Now integrates with backend APIs instead of using local-only state
- Implements proper async/await error handling
- Uses Keycloak JWT token for authentication (automatic via axiosConfig)
- Maps backend responses to UI format (skuCode → id)

**New Features:**

#### `loadCart()` - Fetches cart from backend
```javascript
// Called on component mount to load persisted cart
await loadCart(); // GET /api/cart
```

#### `addToCart(product)` - Adds item with backend persistence
```javascript
// Requires: skuCode, price, name, productName
await addToCart({
  skuCode: 'PROD-001',
  price: 29.99,
  name: 'Product Name',
  productName: 'Product Name'
})
// POST /api/cart/add with payload:
// { skuCode, quantity: 1, price, productName }
```

#### `updateQuantity(productId, newQuantity)` - Real-time stock validation
```javascript
// PUT /api/cart/item/{skuCode}?quantity={newQuantity}
// Backend automatically deletes item if quantity reaches 0
await updateQuantity('PROD-001', 5);
```

#### `removeFromCart(productId)` - Removes item from backend
```javascript
// DELETE /api/cart/item/{skuCode}
await removeFromCart('PROD-001');
```

**Error Handling:**
- Stock allocation failures (400/500) trigger: `"Sorry, not enough stock available for this quantity."`
- Network errors show: `"Failed to [action]. Please try again."`
- Local cart state **only updates after successful backend response**
- Failed requests trigger automatic cart reload from backend to ensure consistency

---

### 4. 📄 Updated Cart.jsx
**File**: `frontend/src/pages/Cart.jsx`

**Changes:**
- Added `useEffect` hook to call `loadCart()` on component mount
- Displays loading state while cart is being fetched
- Passes new async context methods to child components
- Shows "Loading your cart..." message during initial load

```javascript
useEffect(() => {
  loadCart(); // Runs once on mount
}, [loadCart]);
```

---

### 5. 🛒 Enhanced CartItem.jsx
**File**: `frontend/src/components/cart/CartItem.jsx`

**Changes:**
- Added loading states for quantity/remove operations
- Disabled UI interactions while API call is in progress
- Shows "..." during operation completion
- Visual feedback (reduced opacity) during loading
- Fixed toFixed(2) formatting for currency display

```javascript
const [isUpdating, setIsUpdating] = useState(false);

const handleQuantityChange = async (newQuantity) => {
  setIsUpdating(true);
  try {
    await onQuantityChange(id, newQuantity);
  } finally {
    setIsUpdating(false);
  }
};
```

---

### 6. 📡 Enhanced cartApi.js
**File**: `frontend/src/api/cartApi.js`

**Improvements:**
- Added comprehensive JSDoc comments with endpoint details
- Endpoint validation (checks for required fields)
- Error propagation to caller
- Documented all API contracts

**Endpoints (All secured with JWT via axiosConfig):**

| Method | Endpoint | Payload |
|--------|----------|---------|
| GET | `/api/cart` | - |
| POST | `/api/cart/add` | `{skuCode, quantity, price, productName}` |
| PUT | `/api/cart/item/{skuCode}?quantity={newQuantity}` | - |
| DELETE | `/api/cart/item/{skuCode}` | - |

---

## 🚨 Stock Allocation Error Handling (CRITICAL FEATURE)

The frontend now properly handles real-time stock validation:

### Error Flow:
1. User clicks "+" to add item or tries to add item with insufficient stock
2. Frontend sends API request: `PUT /api/cart/item/{skuCode}?quantity={newQuantity}`
3. Backend validates stock in real-time via Cart → Inventory service
4. **If insufficient stock:**
   - Backend returns 400/500 error with message
   - Frontend catches error and shows toast: `"Sorry, not enough stock available for this quantity."`
   - **Local cart state is NOT updated**
   - Cart automatically reloads from backend to ensure consistency
5. **If stock available:**
   - Backend reserves stock (soft allocation)
   - Cart state updates immediately
   - User sees updated quantity

### Example Error Handling:
```javascript
try {
  await updateCartItem(skuCode, newQuantity);
  // Update local state only on success
  setCartItems(prevItems => [...]);
} catch (err) {
  if (err.response?.status === 400 || err.response?.status === 500) {
    // Stock allocation error
    toast.error(`Sorry, not enough stock available for this quantity.`);
  } else {
    toast.error('Failed to update quantity. Please try again.');
  }
  // Reload cart from backend to ensure consistency
  await loadCart();
}
```

---

## 🔐 Database Behavior

### Quantity = 0 Handling:
- User clicks "-" when quantity is 1
- Frontend sends: `PUT /api/cart/item/{skuCode}?quantity=0`
- **Backend automatically deletes the item** (you don't need frontend logic for this)
- Frontend detects removal and updates local state

### Real-Time Soft Allocation:
- Each successful `POST /api/cart/add` or `PUT` call reserves stock
- Prevents double-selling across multiple users
- Inventory is locked until order is placed or cart is abandoned

---

## 🧪 Testing the Integration

### Test Scenario 1: Add Item with Sufficient Stock
1. Add item to cart
2. See success toast: "Product Name added to cart!"
3. Verify cart reloads from backend

### Test Scenario 2: Oversell Protection
1. User A adds 5 units (stock reserved)
2. User B tries to add 10 units
3. See error toast: "Sorry, not enough stock available for this quantity."
4. User B's cart remains unchanged

### Test Scenario 3: Quantity Update with Insufficient Stock
1. Item in cart with quantity 2
2. Click "+" to increase to 5 (but only 3 available)
3. See error: "Sorry, not enough stock available for this quantity."
4. Quantity remains at 2

### Test Scenario 4: Quantity = 0 Auto-Delete
1. Item in cart with quantity 1
2. Click "-" button
3. Backend deletes item automatically
4. Frontend updates and shows: "Item removed from cart"

---

## 📋 API Contract Details

### GET /api/cart
**Response:**
```json
{
  "items": [
    {
      "skuCode": "PROD-001",
      "productName": "Laptop",
      "price": 1299.99,
      "quantity": 2,
      "image": "url or null"
    }
  ]
}
```

### POST /api/cart/add
**Request:**
```json
{
  "skuCode": "PROD-001",
  "quantity": 1,
  "price": 1299.99,
  "productName": "Laptop"
}
```
**Error Response (400/500):**
```json
{
  "message": "Not enough stock available"
}
```

### PUT /api/cart/item/{skuCode}?quantity={newQuantity}
**Response:** Updated item or empty (if quantity=0)

### DELETE /api/cart/item/{skuCode}
**Response:** Confirmation or empty

---

## 🔄 Component Flow Diagram

```
App
 ├─ CartProvider
 │   └─ loadCart() [useEffect on mount]
 │       ├─ GET /api/cart (with JWT token)
 │       └─ Maps backend response to UI format
 │
 └─ Cart Page
     ├─ onLoad: Triggers loadCart()
     ├─ Shows loading state
     │
     └─ CartList
         └─ CartItem (mapped over items)
             ├─ onQuantityChange → updateQuantity()
             │   └─ PUT /api/cart/item/{skuCode}?quantity={newQuantity}
             │   └─ On error: Show toast + reload cart
             │
             └─ onRemove → removeFromCart()
                 └─ DELETE /api/cart/item/{skuCode}
                 └─ On error: Show toast
```

---

## 🚀 Next Steps

### 1. **Environment Variables**
Ensure your `.env` file has:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_KEYCLOAK_TOKEN_URL=http://localhost:8180/realms/order-system-realm/protocol/openid-connect/token
VITE_KEYCLOAK_CLIENT_ID=order-system-client
```

### 2. **Test with Keycloak**
- Verify token is stored in `localStorage.access_token`
- Check browser DevTools Network tab for `Authorization: Bearer <token>` headers
- Verify 401 errors trigger token refresh

### 3. **Backend Integration**
- Ensure API Gateway routes `/api/cart/*` to Cart Service
- Verify Cart Service calls Inventory Service for stock validation
- Test error responses return 400/500 with appropriate messages

### 4. **Optional Enhancements**
- Add loading spinners in CartItem while updating
- Add confirmation dialog before removing items
- Implement cart persistence (auto-save to backend periodically)
- Add detailed error messages based on backend response
- Track stock availability in real-time

---

## 📝 File Summary

| File | Status | Changes |
|------|--------|---------|
| `frontend/src/utils/toast.js` | NEW | Toast notification system |
| `frontend/src/context/CartContext.jsx` | REFACTORED | Backend integration + error handling |
| `frontend/src/pages/Cart.jsx` | UPDATED | Added useEffect to load cart |
| `frontend/src/components/cart/CartItem.jsx` | ENHANCED | Async operations + loading states |
| `frontend/src/api/cartApi.js` | ENHANCED | Documentation + error handling |
| `frontend/src/api/axiosConfig.js` | NO CHANGE | Already configured correctly ✓ |

---

## ✅ Verification Checklist

- [x] JWT token automatically included in all API calls
- [x] Cart loads from backend on component mount
- [x] Add item with backend persistence and stock validation
- [x] Update quantity with real-time stock allocation
- [x] Remove item with backend persistence
- [x] Stock allocation errors trigger toast messages
- [x] Local state only updates on successful backend response
- [x] Failed operations trigger automatic cart reload
- [x] Loading states prevent duplicate API calls
- [x] Quantity = 0 handled by backend (auto-delete)
- [x] All API endpoints match specifications

---

## 🎯 Key Design Decisions

1. **No Optimistic Updates**: Cart state only updates after backend confirms to ensure consistency with real-time stock allocation
2. **Auto-Reload on Error**: Failed operations reload cart from backend to stay in sync
3. **Toast-Only Errors**: User feedback via toasts, no modal dialogs for better UX
4. **Async/Await Pattern**: Modern error handling with try/catch
5. **Stateless API**: Each call is independent, no session required beyond JWT

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify JWT token in localStorage: `localStorage.getItem('access_token')`
3. Check Network tab for `Authorization` header in requests
4. Verify backend API responses match expected format
5. Check that API Gateway is routing requests correctly
