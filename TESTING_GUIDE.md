# Complete Testing Guide

## Prerequisites
1. PostgreSQL database running (optional for basic testing)
2. Node.js 20+ installed
3. Python 3.8+ installed
4. Flutter installed (for mobile app testing)

## Services to Start

### Terminal 1: Python Chatbot Service
```bash
cd product_listing_app/backend
./setup_venv.sh  # First time only
./start_chatbot.sh
```
**Expected:** Service running on `http://localhost:8000`

### Terminal 2: Express Backend
```bash
cd product_listing_app/backend
npm install  # First time only
npm run dev
```
**Expected:** Backend running on `http://localhost:5001`

### Terminal 3: Next.js Frontend
```bash
cd product_listing_app
npm install  # First time only
npm run dev
```
**Expected:** Frontend running on `http://localhost:3000`

---

## Test Checklist

### ✅ 1. Home Page - Product Display by Tags

**Test Steps:**
1. Open `http://localhost:3000`
2. Check Hero Slider loads
3. Scroll to "Flash Sale Faves" section
   - Should show products with "Sale" tag or discount
4. Scroll to "Women's New Arrivals" section
   - Should show products with "New" tag
5. Scroll to "Trending Now" section
   - Should show products with "Trending" tag

**Expected Results:**
- ✅ Products load from backend API
- ✅ No console errors
- ✅ Images display correctly
- ✅ Product cards are clickable

**Check Browser Console:**
- Look for API calls to `http://localhost:5001/api/product?tag=...`
- No 404 or 500 errors

---

### ✅ 2. Category Navigation

**Test Steps:**
1. Click on "Women" in navbar
2. Check dropdown shows subcategories (Tops, Jackets, Trousers, etc.)
3. Click on "Tops"
4. Verify products filter correctly

**Expected Results:**
- ✅ Category page loads: `/categories/women`
- ✅ Subcategory page loads: `/categories/women/tops`
- ✅ Products filtered by category/subcategory
- ✅ Breadcrumb navigation works

**Test URLs:**
- `/categories/women`
- `/categories/women/tops`
- `/categories/women/jackets`
- `/categories/men`
- `/categories/kids`

---

### ✅ 3. Cart Functionality (Guest User)

**Test Steps:**
1. **Without logging in:**
   - Click on a product
   - Click "Add to Cart"
   - Open cart drawer (shopping bag icon)
   - Verify item appears
   - Change quantity
   - Remove item
   - Add multiple items

**Expected Results:**
- ✅ Cart stores in localStorage
- ✅ Cart count updates in header
- ✅ Items persist on page refresh
- ✅ Total price calculates correctly
- ✅ Free shipping shows if total > $75

**Check Browser:**
- Open DevTools → Application → Local Storage
- Should see `cart-storage` key

---

### ✅ 4. Cart Functionality (Logged-in User)

**Test Steps:**
1. Register/Login at `/auth/register` or `/auth/login`
2. Add product to cart
3. Check cart drawer
4. Verify cart syncs with backend

**Expected Results:**
- ✅ Cart saved to database
- ✅ Cart persists across devices (if same account)
- ✅ API calls to `/api/cart`

**Check Network Tab:**
- `POST /api/cart` - Add to cart
- `GET /api/cart` - Get cart
- `PUT /api/cart/item/:id` - Update quantity
- `DELETE /api/cart/item/:id` - Remove item

---

### ✅ 5. Checkout - Cash on Delivery

**Test Steps:**
1. Add items to cart
2. Go to `/checkout`
3. Fill in contact information (Step 1)
4. Fill in shipping address (Step 2)
5. Select "Cash on Delivery" (Step 3)
6. Submit order

**Expected Results:**
- ✅ Order created successfully
- ✅ Redirected to order receipt page
- ✅ Cart cleared
- ✅ Stock decreased in database
- ✅ Order visible in admin dashboard

**Check Backend:**
- Order in database with `paymentMethod: 'cod'`
- Product stock reduced
- Order status: "pending"

---

### ✅ 6. Checkout - Stripe Payment

**Test Steps:**
1. Add items to cart
2. Go to `/checkout`
3. Fill all forms
4. Select "Credit/Debit Card"
5. Submit order

**Expected Results:**
- ✅ Redirects to Stripe Checkout
- ✅ Can complete test payment
- ✅ Redirects back to order receipt
- ✅ Order created after payment

**Note:** Requires Stripe keys configured

---

### ✅ 7. Stock Management

**Test Steps:**
1. Check product stock in database
2. Add product to cart
3. Place order
4. Check stock decreased

**Expected Results:**
- ✅ Stock decreases when order placed
- ✅ Cannot order more than available stock
- ✅ Error message if stock insufficient

**Test Edge Cases:**
- Try to add more items than stock available
- Should show error: "Insufficient stock"

---

### ✅ 8. Admin Dashboard - Order Management

**Test Steps:**
1. Login as admin
2. Go to `/admin/orders`
3. View all orders
4. Update order status
5. Check order details

**Expected Results:**
- ✅ All orders visible
- ✅ Can filter by status
- ✅ Can update order status
- ✅ Order details show correctly

---

### ✅ 9. Admin Dashboard - Stock Management

**Test Steps:**
1. Go to `/admin/products`
2. Add new product with stock quantity
3. Edit existing product stock
4. Verify stock updates

**Expected Results:**
- ✅ Can set stock when creating product
- ✅ Can update stock when editing product
- ✅ Stock reflects in product listings

---

### ✅ 10. Chatbot Integration

**Test Steps:**
1. Click floating chat button
2. Send message: "Hello"
3. Send message: "Show me dresses"
4. Verify navigation works

**Expected Results:**
- ✅ Chatbot responds
- ✅ Navigation works (e.g., redirects to dresses)
- ✅ Works without login (guest)
- ✅ Chat history saved for logged-in users

**Test Messages:**
- "Hello" → Greeting response
- "Show me dresses" → Navigate to dresses
- "What's on sale?" → Show sale products
- "New arrivals" → Show new products

---

### ✅ 11. Product Search & Filtering

**Test Steps:**
1. Go to `/products`
2. Use search bar
3. Apply filters (brand, price, size, etc.)
4. Sort products

**Expected Results:**
- ✅ Search works
- ✅ Filters apply correctly
- ✅ Sorting works
- ✅ Products update dynamically

---

### ✅ 12. Product Detail Page

**Test Steps:**
1. Click on any product
2. View product details
3. Add to cart from detail page
4. Check view count increments

**Expected Results:**
- ✅ Product details load
- ✅ Images display
- ✅ Add to cart works
- ✅ View count increments in database

---

## Common Issues & Solutions

### Issue: Products not loading
**Solution:**
- Check backend is running on port 5001
- Check API calls in Network tab
- Verify database connection (if using DB)

### Issue: Cart not working
**Solution:**
- Check localStorage in DevTools
- For logged-in users, check backend cart API
- Verify authentication token

### Issue: Checkout fails
**Solution:**
- Check all form fields filled
- Verify backend order API working
- Check stock availability

### Issue: Stripe not working
**Solution:**
- Verify `STRIPE_SECRET_KEY` in backend `.env`
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in frontend `.env.local`
- Check Stripe keys are valid

---

## API Endpoints to Test

### Products
- `GET /api/product` - Get all products
- `GET /api/product?tag=Sale` - Get products by tag
- `GET /api/product?department=Women` - Filter by department
- `GET /api/product/:id` - Get single product

### Cart
- `GET /api/cart` - Get cart (logged-in)
- `POST /api/cart` - Add to cart
- `PUT /api/cart/item/:id` - Update quantity
- `DELETE /api/cart/item/:id` - Remove item

### Orders
- `POST /api/order` - Create order
- `GET /api/order` - Get orders
- `PUT /api/order/:id/status` - Update status (admin)

### Payment
- `POST /api/payment/create-checkout-session` - Stripe checkout

### Chat
- `POST /api/chat/send` - Send message
- `GET /api/chat/history` - Get history

---

## Quick Test Commands

```bash
# Test backend API
curl http://localhost:5001/api/product

# Test Python chatbot
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "user_id": null}'

# Check backend logs
# Look for any errors in terminal running backend
```

---

## Success Criteria

✅ All features work as expected
✅ No console errors
✅ No network errors (404, 500)
✅ Data persists correctly
✅ Stock management works
✅ Orders create successfully
✅ Admin can manage orders
✅ Guest and logged-in users both work

