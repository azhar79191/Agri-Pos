# Shop Switching Guide

## Current System Architecture

### How It Works Now
- Each user is assigned to **ONE shop** when created
- User's shop is stored in `user.shop` field (reference to shop ID)
- Shop data is loaded on login and synced to AppContext
- All operations (products, invoices, etc.) are scoped to the user's shop

### User-Shop Relationship
```javascript
User {
  _id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  role: "admin" | "manager" | "cashier",
  shop: "shop-id" // Single shop reference
}
```

---

## How to Switch/Login to Another Shop

### Option 1: Multiple User Accounts (Current System)
**Best for**: Different shops with different staff

**Steps:**
1. Create a separate user account for each shop
2. Each user is assigned to their respective shop
3. Logout and login with different credentials to switch shops

**Example:**
```
Shop A:
- User: admin@shopA.com
- Password: password123

Shop B:
- User: admin@shopB.com
- Password: password456
```

**Pros:**
- ✅ Simple and secure
- ✅ Clear separation of data
- ✅ Each shop has its own team
- ✅ No code changes needed

**Cons:**
- ❌ Need to logout/login to switch
- ❌ Multiple credentials to remember

---

### Option 2: Multi-Shop Support (Requires Implementation)
**Best for**: Users who manage multiple shops

This requires backend and frontend changes:

#### Backend Changes Needed:

1. **Update User Schema**
```javascript
User {
  _id: "user-id",
  name: "John Doe",
  email: "john@example.com",
  role: "admin",
  shops: [
    { shop: "shop-id-1", role: "admin" },
    { shop: "shop-id-2", role: "manager" }
  ],
  activeShop: "shop-id-1" // Currently selected shop
}
```

2. **Add Shop Switching API**
```javascript
// POST /api/auth/switch-shop
{
  shopId: "shop-id-2"
}
```

3. **Update All APIs**
- Add shop context to all queries
- Filter data by activeShop
- Validate user has access to requested shop

#### Frontend Changes Needed:

1. **Add Shop Selector Component**
2. **Update AppContext to handle shop switching**
3. **Add shop switcher in Header/Sidebar**
4. **Refresh data after shop switch**

---

## Implementation Guide for Multi-Shop Support

### Step 1: Create Shop Selector Component

```jsx
// src/components/ShopSelector.jsx
import React, { useState } from 'react';
import { Building2, Check } from 'lucide-react';

const ShopSelector = ({ shops, activeShop, onSwitch }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
      >
        <Building2 className="w-4 h-4" />
        <span className="text-sm font-medium">
          {activeShop?.name || 'Select Shop'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-xl border">
          {shops.map(shop => (
            <button
              key={shop._id}
              onClick={() => {
                onSwitch(shop._id);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{shop.name}</p>
                <p className="text-xs text-gray-500">{shop.address}</p>
              </div>
              {activeShop?._id === shop._id && (
                <Check className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopSelector;
```

### Step 2: Add Switch Shop API

```javascript
// src/api/authApi.js
export const switchShop = (shopId) => API.post("/auth/switch-shop", { shopId });
```

### Step 3: Update AppContext

```javascript
// Add to AppContext actions
switchShop: async (shopId) => {
  try {
    const res = await switchShop(shopId);
    const updatedUser = res.data.data.user;
    
    // Update user in context
    dispatch({ type: ACTIONS.LOGIN, payload: updatedUser });
    
    // Update settings with new shop data
    const shop = updatedUser.activeShop;
    dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: {
      shopName: shop.name,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      shopLogo: shop.logo,
      taxRate: shop.taxRate,
      currency: shop.currency,
      receiptFooter: shop.receiptFooter,
    }});
    
    // Clear cart
    dispatch({ type: ACTIONS.CLEAR_CART });
    
    // Refresh all data
    window.location.reload(); // Or manually refresh each context
    
    actions.showToast({ 
      message: `Switched to ${shop.name}`, 
      type: "success" 
    });
  } catch (err) {
    actions.showToast({ 
      message: "Failed to switch shop", 
      type: "error" 
    });
  }
}
```

### Step 4: Add to Header

```jsx
// src/components/Header.jsx
import ShopSelector from './ShopSelector';

// In Header component
{currentUser?.shops?.length > 1 && (
  <ShopSelector
    shops={currentUser.shops}
    activeShop={currentUser.activeShop}
    onSwitch={actions.switchShop}
  />
)}
```

---

## Quick Solution: Using Current System

### For Admin Managing Multiple Shops

**Create separate admin accounts:**

```bash
# Shop 1: AgroCare Pesticides
Email: admin@agrocare.com
Password: [secure-password]

# Shop 2: GreenLeaf Agro
Email: admin@greenleaf.com
Password: [secure-password]
```

**To switch shops:**
1. Click logout button
2. Login with different shop's credentials
3. All data will be scoped to that shop

### For Staff Working at Multiple Shops

**Create separate accounts for each shop:**

```bash
# John at Shop A
Email: john@shopA.com
Shop: Shop A
Role: Manager

# John at Shop B
Email: john@shopB.com
Shop: Shop B
Role: Cashier
```

---

## Database Setup for Multi-Shop

### Current Schema
```javascript
// User belongs to ONE shop
{
  _id: ObjectId,
  name: String,
  email: String,
  shop: ObjectId, // Single reference
  role: String
}
```

### Multi-Shop Schema
```javascript
// User can belong to MULTIPLE shops
{
  _id: ObjectId,
  name: String,
  email: String,
  shops: [
    {
      shop: ObjectId,
      role: String, // Role in this shop
      permissions: [String]
    }
  ],
  activeShop: ObjectId, // Currently selected
  defaultShop: ObjectId // Default on login
}
```

---

## Migration Path

### Phase 1: Current System (No Changes)
- Use separate accounts per shop
- Simple logout/login to switch

### Phase 2: Add Multi-Shop Support
1. Update backend user schema
2. Add shop switching API
3. Update frontend with shop selector
4. Migrate existing users

### Phase 3: Advanced Features
- Shop-specific permissions
- Cross-shop reporting
- Shop transfer functionality
- Shop groups/organizations

---

## Recommended Approach

### For Most Users: **Use Current System**
- Create separate user accounts for each shop
- Logout and login to switch shops
- Simple, secure, and works now

### For Advanced Users: **Implement Multi-Shop**
- Follow implementation guide above
- Requires backend changes
- Better UX for multi-shop managers

---

## Security Considerations

### Current System
- ✅ Clear data separation
- ✅ No cross-shop data leaks
- ✅ Simple permission model

### Multi-Shop System
- ⚠️ Must validate shop access on every request
- ⚠️ Risk of data leaks if not implemented correctly
- ⚠️ Complex permission management
- ✅ Better user experience
- ✅ Single login for multiple shops

---

## FAQ

### Q: Can I access multiple shops with one account?
**A:** Not in the current system. You need separate accounts for each shop.

### Q: How do I switch between shops?
**A:** Logout and login with the other shop's credentials.

### Q: Can I implement multi-shop support?
**A:** Yes, follow the implementation guide above. Requires backend changes.

### Q: Will my data be mixed between shops?
**A:** No, each shop's data is completely separate.

### Q: Can I transfer data between shops?
**A:** Not currently. Would need custom implementation.

### Q: How do I create a new shop?
**A:** 
1. Create a new admin user
2. Login with that user
3. Go to "My Shop" page
4. Fill in shop details

### Q: Can multiple users manage the same shop?
**A:** Yes! Add team members in "My Shop" → "Team Members" tab.

---

## Summary

**Current System:**
- ✅ One user = One shop
- ✅ Logout/login to switch
- ✅ Simple and secure
- ✅ Works now

**Multi-Shop System:**
- ⚠️ Requires implementation
- ✅ Better UX
- ✅ Single login
- ⚠️ More complex

**Recommendation:** Use current system unless you specifically need multi-shop support for the same user.
