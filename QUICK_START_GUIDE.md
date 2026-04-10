# 🚀 Quick Start Guide - Food Delivery App (Fixed)

## Prerequisites
- Node.js installed
- npm installed
- Backend and Frontend directories set up

---

## 🔧 Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify db.json exists:**
   ```bash
   # Check backend/config/db.json
   # It should contain users, restaurants, menus, etc.
   ```

4. **Start the server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

   **Expected Output:**
   ```
   Server running on port 5000
   ```

---

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   ng serve
   # or
   npm start
   ```

   **Expected Output:**
   ```
   ✔ Compiled successfully.
   Application bundle generated successfully in 45.23 seconds.
   ```

4. **Open in browser:**
   ```
   http://localhost:4200
   ```

---

## ✅ Testing Workflow

### Test 1: Register a New User

1. Navigate to **http://localhost:4200/auth/register**
2. Fill in the form:
   - **Username:** `testuser123`
   - **Email:** `test@example.com`
   - **Phone:** `9999999999`
   - **Password:** `password123`
   - **Confirm Password:** `password123`
   - **Role:** `Customer` (or `Owner`)
3. Click **Register**
4. Should redirect to **Login** page

**Verify:** Check `backend/config/db.json` - should see new user in `users` array

---

### Test 2: Login with Registered User

1. Navigate to **http://localhost:4200/auth/login**
2. Select role: **Customer**
3. Enter credentials:
   - **Email:** `test@example.com`
   - **Password:** `password123`
4. Click **Login as Customer**

**Expected Result:**
- ✅ Redirected to `/user/home`
- ✅ Navbar shows username
- ✅ User stored in localStorage

**Verify:** Open Browser DevTools → Application → LocalStorage → Look for "user" key

---

### Test 3: View Profile

1. Click your **username** in navbar → **Profile**
2. Should see:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Phone: `9999999999`
   - Role: `Customer`
   - Address: (empty or set)

---

### Test 4: Edit Profile

1. On Profile page, click **Edit Profile**
2. Change username to: `testuser_updated`
3. Change address to: `123 Main St, New York`
4. Click **Save Changes**

**Expected:**
- ✅ Success message appears
- ✅ Fields update
- ✅ Data persists in localStorage

---

### Test 5: Logout

1. Click on username dropdown → **Logout**
2. Should be redirected to **Login** page

**Verify:**
- ✅ localStorage is cleared
- ✅ Navbar no longer shows username

---

### Test 6: Login with Owner Role

1. Go to **Login** page
2. Select role: **Owner**
3. Use credentials from existing owner in db.json:
   - **Email:** `rohit.agarwal1@example.com` (from db.json)
   - **Password:** `password123` (plain text from db.json)
4. Click **Login as Owner**

**Expected Result:**
- ✅ Redirected to `/owner/dashboard`
- ✅ Can access profile at `/owner/profile`

---

### Test 7: Testing API Directly (Optional)

**Register via Postman/Curl:**
```bash
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@test.com",
  "phoneNo": "9988776655",
  "password": "pass123",
  "role": "Customer"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "usr_xxxxx",
    "username": "newuser",
    "email": "newuser@test.com",
    "phoneNo": "9988776655",
    "role": "Customer",
    "address": [],
    "createdAt": "2025-xx-xxTxx:xx:xx.xxxZ"
  }
}
```

**Login via Postman/Curl:**
```bash
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "newuser@test.com",
  "password": "pass123",
  "role": "Customer"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "usr_xxxxx",
    "username": "newuser",
    "email": "newuser@test.com",
    "phoneNo": "9988776655",
    "role": "Customer",
    "address": [],
    "createdAt": "2025-xx-xxTxx:xx:xx.xxxZ"
  }
}
```

---

## 🔍 Troubleshooting

### Problem: "Port 5000 already in use"
**Solution:**
```bash
# Kill process on port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti :5000 | xargs kill -9
```

### Problem: "Cannot GET /api/users"
**Solution:**
- Check backend is running on port 5000
- Verify routes are correct in `backend/routes/userRoutes.js`

### Problem: "CORS error"
**Solution:**
- Backend has CORS enabled already
- Check `backend/server.js` has `app.use(cors())`

### Problem: "db.json not found"
**Solution:**
- Ensure file exists: `backend/config/db.json`
- File should be valid JSON
- Check permissions are readable/writable

### Problem: "ERROR: User not found after registration"
**Solution:**
- Check `backend/config/db.json` is being updated
- Verify `backend/utils/dbManager.js` writeDB() is working
- Check file system permissions

### Problem: "Infinite loading on login"
**Solution:**
- Open browser DevTools → Console (look for errors)
- Check API response in Network tab
- Verify backend is returning correct JSON structure

---

## 📝 Default Test Users (From db.json)

### Customers:
- **Email:** `ishita.kumar11@example.com`
- **Password:** `password123`
- **Role:** `Customer`

### Owners:
- **Email:** `rohit.agarwal1@example.com`
- **Password:** `password123`
- **Role:** `Owner`

---

## 📊 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

---

## 📁 Key Files Modified

### Backend:
- ✅ `backend/utils/dbManager.js` (NEW)
- ✅ `backend/controllers/userController.js`
- ✅ `backend/routes/userRoutes.js`

### Frontend:
- ✅ `frontend/src/app/core/services/auth.service.ts`
- ✅ `frontend/src/app/modules/auth/login/login.component.ts`
- ✅ `frontend/src/app/modules/user/profile/` (NEW)
- ✅ `frontend/src/app/modules/owner/profile/` (NEW)
- ✅ `frontend/src/app/modules/delivery/profile/` (NEW)
- ✅ `frontend/src/app/shared/components/navbar/navbar.component.ts`

---

## 🎯 Success Indicators

✅ **Backend:**
- Server starts without errors
- API responds to requests
- db.json updates on register
- Login works with plain text password

✅ **Frontend:**
- App loads without console errors
- Register saves to db.json
- Login stores user in localStorage
- Profile page displays user data
- Logout clears localStorage
- Navigation works for all roles

---

## 💡 Notes

1. **db.json is static** - all data is stored in plain JSON file
2. **No JWT** - authentication uses localStorage only
3. **Plain text passwords** - NOT suitable for production
4. **File permissions** - ensure db.json is readable/writable by Node process
5. **Concurrent writes** - db.json may have issues with simultaneous registrations

---

## 🚀 Ready to Test!

Your full-stack food delivery application is now:
- ✅ Using db.json as database
- ✅ Register/Login working
- ✅ Profile system working
- ✅ Logout functionality working
- ✅ No JWT (localStorage-based)

**Start testing and enjoy! 🎉**
