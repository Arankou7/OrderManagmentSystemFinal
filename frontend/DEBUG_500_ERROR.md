# Debugging 500 Error in Checkout

## The Error
```
Cannot place order. Cart is empty!
```

This error comes from `OrderService.placeOrder()` when the backend cannot find items in the cart.

---

## 🔍 Step-by-Step Debug Process

### Step 1: Check Your Frontend Cart Has Items
1. Go to **home page** and **add items to cart**
2. Click **cart icon** - verify items show up
3. **Check cart count** - should NOT be 0
4. Go to **`/cart` page** - verify items display with quantities
5. **Key point**: Don't proceed to checkout if cart is empty!

### Step 2: Check Browser Console Logs
When you click "Place Order":
1. Open **DevTools** (F12) → **Console** tab
2. Look for log: `Placing order with cart items: [...]`
3. **Good sign**: Should show array with items
4. **Bad sign**: Should NOT show empty array `[]`

### Step 3: Check Network Request
1. Open **DevTools** (F12) → **Network** tab
2. Click "Place Order"
3. Look for POST request to `/order`
4. **Check Headers tab**:
   - ✅ `Authorization: Bearer eyJ...` (should have token)
   - This token is extracted to identify the user
5. **Check Response tab**:
   - Should show error message from backend

### Step 4: Verify Cart Backend Service
The backend's `CartClient.getCart(authHeader)` must return items.

**To test manually in Postman:**
```
POST http://localhost:8080/api/order
Headers:
  Authorization: Bearer {your_token}
Body:
  (empty - just {})
```

If you get 500 error, the cart service isn't returning items for that user.

---

## 🛠️ Common Causes & Solutions

### Cause 1: Cart Actually Empty
**Symptoms:**
- You added items but they're not showing
- Cart page shows "Your cart is empty"
- Checkout page blocked with "cart is empty" message

**Solution:**
```
1. Go to Home page
2. Click Add to Cart on a product (check quantity increases)
3. Go to /cart page
4. Verify items display
5. Only then go to Checkout
```

---

### Cause 2: Cart Service Not Returning Items
**Symptoms:**
- Frontend cart shows items ✅
- But backend says cart empty ❌
- 500 error on order placement

**Debug:**
The backend calls `cartClient.getCart(authHeader)`. If this returns empty, the order fails.

**To test:**
```bash
# In Postman
GET http://localhost:8080/api/cart
Headers:
  Authorization: Bearer {your_token}
```

**You should see:**
```json
{
  "items": [
    {
      "skuCode": "PROD-001",
      "quantity": 2,
      "price": 29.99,
      "productName": "Product Name"
    }
  ]
}
```

**If you get empty items or null:**
- ❌ Cart Service has a bug
- ❌ Cart items not being saved properly
- ❌ Issue with user identification

---

### Cause 3: JWT Token Not Being Passed Correctly
**Symptoms:**
- Backend can't identify the user
- Cart Service returns someone else's cart (or empty)
- 500 error on order

**Debug:**
1. Check **localStorage** has token:
   ```javascript
   // In browser console:
   localStorage.getItem('access_token')
   ```
   Should NOT be `null` ✅

2. Check **Network tab** shows Authorization header:
   - POST `/order` request
   - Headers tab
   - Should see: `Authorization: Bearer eyJ...`

---

### Cause 4: Backend Session/User Issue
**Symptoms:**
- Token looks correct
- Cart endpoint works in Postman
- But order fails with 500

**Debug:**
Check if multiple user sessions are confused:
```bash
# Test with your exact credentials
# In Postman GET http://localhost:8080/api/cart
# Headers: Authorization: Bearer {same_token}
# Should return YOUR cart items, not empty
```

---

## ✅ Full Debugging Checklist

Before placing order, verify:

- [ ] Added items to cart (count > 0)
- [ ] Home page shows cart icon with item count
- [ ] `/cart` page displays items
- [ ] localStorage has `access_token`
- [ ] POST `/order` request has `Authorization: Bearer` header
- [ ] GET `/cart` returns items (test in Postman)
- [ ] Backend logs show `getCart()` returning items
- [ ] No errors in browser console except the 500

---

## 🔧 Quick Fixes to Try

### Fix 1: Refresh and Re-Login
```
1. Close app (Cmd+W or Ctrl+W)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Go to http://localhost:5174
4. Log in with Keycloak again
5. Add items to cart
6. Try checkout
```

### Fix 2: Check Cart Service Logs
Look at your **Cart Service** backend logs:
```
Does it say:
✅ "Cart retrieved for user: student@thesis.com"
or
❌ "Cart not found" / "Cart is null"
```

If it's returning null, the Cart Service has a bug.

### Fix 3: Test Cart Endpoint First
Before testing checkout, verify cart works:
```bash
# In Postman
GET http://localhost:8080/api/cart
Auth: Bearer {your_token}

# Should see your items, not empty array
```

---

## 📝 What to Check in Your Backend

### In OrderService.placeOrder()
```java
CartResponse cart = cartClient.getCart(authHeader);

// ADD THIS DEBUG LOG:
System.out.println("Cart response: " + cart);
System.out.println("Cart items: " + (cart != null ? cart.items() : "null"));

if (cart == null || cart.items() == null || cart.items().isEmpty()) {
    throw new RuntimeException("Cannot place order. Cart is empty!");
}
```

### In CartController
```java
// Verify cart endpoint is working
@GetMapping
public CartResponse getCart(@RequestHeader("Authorization") String token) {
    System.out.println("Cart requested with token: " + token);
    CartResponse response = cartService.getCartByUser(token);
    System.out.println("Cart response items: " + response.items());
    return response;
}
```

---

## 🚀 The Complete Flow That Should Work

```
1. User adds item "Laptop" to cart
   ✅ Frontend: cartItems = [{id: 1, name: "Laptop", quantity: 2}]
   ✅ Backend: Cart Service stores item

2. User clicks "Proceed to Checkout"
   ✅ Navigate to /checkout

3. User clicks "Place Order"
   ✅ Checkout.jsx sends: POST /order {}
   ✅ JWT token in Authorization header

4. Backend receives request
   ✅ OrderService.placeOrder() called
   ✅ Extracts user from JWT token
   ✅ Calls CartClient.getCart(authHeader)
   ✅ Cart Service returns: {items: [{skuCode: "PROD-001", quantity: 2}]}
   ✅ Creates order with those items
   ✅ Returns: {orderNumber: "UUID", status: "PENDING"}

5. Frontend receives response
   ✅ Shows toast: "Order UUID placed successfully!"
   ✅ Clears cart
   ✅ Redirects to home
```

---

## 🆘 If Still Stuck

1. **Check backend logs** - what exact error is thrown?
2. **Test Cart endpoint in Postman** - does it return items?
3. **Verify user token** - is it correct?
4. **Check Cart Service** - is it persisting items?
5. **Check database** - are cart items being saved?

The 500 error means your backend Cart Service is returning null or empty items when the Order Service tries to fetch them.

---

## 📋 Information to Collect

When debugging, gather:
```
1. User email: student@thesis.com
2. JWT token (first 20 chars): eyJ0eXAiOi...
3. Cart service endpoint result: (empty or items?)
4. Backend OrderService logs: (what error?)
5. Frontend console output: (any other errors?)
```

This will help pinpoint exactly where the flow breaks.
