# Technical Architecture - Before vs After

## System Architecture Comparison

### BEFORE (Issues)
```
Frontend (Angular)
    ↓ [JWT Token in Header]
Backend (Express)
    ↓ [JWT Verification]
MongoDB (NOT SET UP)
    ↓ [Bcrypt Hashing]
generate_db_json.py (UNUSED)


PROBLEMS:
❌ MongoDB not configured
❌ Python script unnecessary
❌ JWT disabled but still in code
❌ Bcrypt used but db.json has plain text
❌ No proper seed workflow
❌ Login/Register broken
```

### AFTER (Fixed)
```
Frontend (Angular)
    ↓ [User in localStorage]
Backend (Express)
    ↓ [Read from db.json]
db.json (Static Database)
    ↓ [Write to file system]
dbManager.js (HANDLES ALL I/O)


BENEFITS:
✅ Single source of truth (db.json)
✅ No database setup needed
✅ Fast development
✅ Easy testing
✅ Clear data flow
```

---

## Component Diagram

### Authentication Flow
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Login      │  │  Register    │  │   Profile    │   │
│  │ Component    │  │ Component    │  │ Component    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │             │
│         └─────────────────┬─────────────────┘             │
│                           │                                │
│                    ┌──────┴──────────┐                    │
│                    │  AuthService    │                    │
│                    │  - login()      │                    │
│                    │  - register()   │                    │
│                    │  - logout()     │                    │
│                    └──────┬──────────┘                    │
│                           │                                │
│                    ┌──────┴──────────┐                    │
│                    │  ApiService     │                    │
│                    │  HTTP Calls     │                    │
│                    └──────┬──────────┘                    │
│                           │                                │
│              localStorage ├──────────────────────┐         │
│              (User Data)  │                     │         │
└──────────────────────────┼─────────────────────┼─────────┘
                            │                     │
                            ↓ HTTP POST/GET      ↓
┌─────────────────────────────────────────────────────────┐
│                Backend (Express)                         │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │        userRoutes.js                           │    │
│  │  ├─ POST   /api/users              (register)  │    │
│  │  ├─ POST   /api/users/login        (login)     │    │
│  │  ├─ GET    /api/users/:id          (getUser)   │    │
│  │  ├─ PUT    /api/users/:id          (update)    │    │
│  │  └─ DELETE /api/users/:id          (delete)    │    │
│  └──────────────┬─────────────────────────────────┘    │
│                 │                                        │
│  ┌──────────────┴─────────────────────────────────┐    │
│  │    userController.js                           │    │
│  │  - createUser()   ├─→ All use                  │    │
│  │  - loginUser()    ├─→ dbManager.js             │    │
│  │  - getUser()      ├─→ for read/write           │    │
│  │  - updateUser()   │                            │    │
│  │  - deleteUser()   └─→                          │    │
│  └──────────────┬─────────────────────────────────┘    │
│                 │                                        │
│  ┌──────────────┴─────────────────────────────────┐    │
│  │    dbManager.js                                │    │
│  │  - readDB()                                   │    │
│  │  - writeDB(data)                              │    │
│  │  - findUserByEmail(email)                     │    │
│  │  - findUserById(id)                           │    │
│  │  - findUserByUsername(username)               │    │
│  │  - addUser(user)                              │    │
│  │  - updateUser(userId, updates)                │    │
│  │  - getAllUsers(role)                          │    │
│  │  - getUserWithoutPassword(user)               │    │
│  └──────────────┬─────────────────────────────────┘    │
│                 │                                        │
│                 ↓ fs.readFileSync/writeFileSync         │
└─────────────────┼────────────────────────────────────────┘
                  │
                  ↓
         ┌────────────────┐
         │  db.json       │
         │  ┌──────────────┤
         │  │ {            │
         │  │   "users": [ │
         │  │     {...},   │
         │  │     {...}    │
         │  │   ],         │
         │  │   "...": []  │
         │  │ }            │
         │  └──────────────┤
         │  (File System) │
         └────────────────┘
```

---

## Authentication Sequence Diagram

### Register Sequence
```
User              Frontend                Backend           db.json
 │                   │                       │                 │
 ├─ Fill Form ──────→│                       │                 │
 │                   │                       │                 │
 │                   ├─ POST /api/users ─────→│                 │
 │                   │   (username,           │                 │
 │                   │    email, password)    │                 │
 │                   │                       │                 │
 │                   │                       ├─ findUserByEmail()
 │                   │                       │                 │
 │                   │                       ├─ findUserByUsername()
 │                   │                       │                 │
 │                   │                       ├─ addUser()       │
 │                   │                       │                 │
 │                   │                       ├─ writeDB() ─────→│
 │                   │                       │   (fs.writeFileSync)
 │                   │                       │                 │
 │                   │     Success Response  │                 ├─ Save new user
 │                   │←─────────────────────┤                 │
 │                   │   {success:true,     │                 │
 │                   │    data:{...}}       │                 │
 │                   │                       │                 │
 │ Show Success ←────┤                       │                 │
 │                   │                       │                 │
 │ Redirect to Login │                       │                 │
 │                   │                       │                 │
```

### Login Sequence
```
User              Frontend                Backend           db.json
 │                   │                       │                 │
 ├─ Enter Creds ────→│                       │                 │
 │                   │                       │                 │
 │                   ├─ POST /api/users/login
 │                   │   (email, password) ──→│                 │
 │                   │                       │                 │
 │                   │                       ├─ findUserByEmail()
 │                   │                       │                 │
 │                   │                       ├─ readDB() ──────→│
 │                   │                       │                 ├─ Read users array
 │                   │                       │←─────────────────┤
 │                   │                       │                 │
 │                   │                       ├─ Compare password
 │                   │                       │   (plain text)   │
 │                   │                       │                 │
 │                   │     Success Response  │                 │
 │                   │←─────────────────────┤                 │
 │                   │   {success:true,     │                 │
 │                   │    user:{...}}       │                 │
 │                   │                       │                 │
 │ Save to Storage ←─┤                       │                 │
 │ (localStorage)    localStorage.setItem()  │                 │
 │                   │                       │                 │
 │ Redirect Home     │                       │                 │
 │                   │                       │                 │
```

### Logout Sequence
```
User              Frontend                Backend
 │                   │                       │
 ├─ Click Logout ───→│                       │
 │                   │                       │
 │                   ├─ authService.logout()
 │                   │                       │
 │ Clear Storage ←───┤                       │
 │ (localStorage)    localStorage.removeItem('user')
 │                   │                       │
 │ Redirect Login    │                       │
 │                   │                       │
```

---

## Data Models

### User Model (db.json)
```typescript
interface User {
  id: string;              // usr_xxxxx
  username: string;        // john_doe
  email: string;           // john@example.com
  phoneNo: string;         // +919999999999
  password: string;        // password123 (PLAIN TEXT)
  role: string;            // Customer | Owner | DeliveryAgent
  address: Address[];       // [{street, city}]
  createdAt: string;        // ISO 8601 timestamp
}

interface Address {
  street: string;
  city: string;
}
```

### API Response Format
```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
  user?: T;              // For login endpoint
}

// Error Response
interface ErrorResponse {
  success: false;
  message: string;
}
```

---

## File Structure Changes

### Backend Before
```
backend/
├── controllers/
│   └── userController.js     (uses MongoDB User model)
├── models/
│   └── User.js               (MongoDB model - STILL THERE)
├── generate_db_json.py       (PYTHON SCRIPT - UNUSED)
└── <others>
```

### Backend After
```
backend/
├── controllers/
│   └── userController.js     (uses dbManager)
├── models/
│   └── User.js               (NO LONGER USED)
├── utils/
│   ├── dbManager.js          (NEW - handles db.json I/O)
│   └── <others>
├── config/
│   └── db.json               (ACTUAL DATABASE)
└── <others>
```

### Frontend Before
```
frontend/src/app/
├── shared/
│   └── models/
│       └── index.ts
├── modules/
│   ├── auth/
│   │   └── login/
│   │   └── register/
│   ├── user/              (NO PROFILE COMPONENT)
│   ├── owner/
│   └── delivery/
```

### Frontend After
```
frontend/src/app/
├── shared/
│   └── models/
│       └── index.ts
├── modules/
│   ├── auth/
│   │   ├── login/          (UPDATED)
│   │   └── register/       (UPDATED)
│   ├── user/
│   │   ├── profile/        (NEW - 3 files)
│   │   ├── <others>
│   │   └── user.module.ts  (UPDATED)
│   ├── owner/
│   │   ├── profile/        (NEW - 3 files)
│   │   └── owner.module.ts (UPDATED)
│   └── delivery/
│       ├── profile/        (NEW - 3 files)
│       └── delivery.module.ts (UPDATED)
```

---

## HTTP Request/Response Examples

### Register Request
```http
POST /api/users HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNo": "9999999999",
  "password": "password123",
  "role": "Customer"
}
```

### Register Response (Success)
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "usr_a1b2c3d4",
    "username": "john_doe",
    "email": "john@example.com",
    "phoneNo": "9999999999",
    "role": "Customer",
    "address": [],
    "createdAt": "2025-04-10T12:00:00.000Z"
  }
}
```

### Login Request
```http
POST /api/users/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "Customer"
}
```

### Login Response (Success)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "usr_a1b2c3d4",
    "username": "john_doe",
    "email": "john@example.com",
    "phoneNo": "9999999999",
    "role": "Customer",
    "address": [],
    "createdAt": "2025-04-10T12:00:00.000Z"
  }
}
```

### Error Response
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "message": "Email already exists"
}
```

---

## Authentication Comparison

### JWT-Based (Previous Intent)
```
Header: Authorization: Bearer eyJhb...
Storage: sessionStorage (temporary)
Validation: JWT.verify() on backend
Advantage: Stateless, scalable
Disadvantage: Complex, requires secrets
```

### localStorage-Based (Current)
```
Storage: localStorage (persistent until logout)
User Object: {id, username, email, role, ...}
Validation: AuthGuard checks localStorage
Advantage: Simple, no backend session needed
Disadvantage: Vulnerable to XSS (use HttpOnly for production)
```

---

## Limitations & Future Improvements

### Current Limitations (db.json)
❌ Single file database
❌ No concurrent write handling
❌ Plain text passwords
❌ Not suitable for production
❌ No real-time synchronization
❌ No query optimization
❌ No transaction support

### Production Ready (MongoDB + JWT)
✅ Scalable database
✅ Concurrent write support
✅ Bcrypt password hashing
✅ Secure JWT tokens
✅ Real-time updates possible
✅ Complex queries
✅ ACID transactions

---

## Performance Considerations

### Read Operations
```
db.json (current)           MongoDB (future)
│                           │
├─ fs.readFileSync()        ├─ Database query
├─ JSON.parse()             ├─ Index lookup
├─ Array filter()           ├─ Network I/O
└─ O(n) complexity          └─ O(log n) complexity

Current: ~5-10ms            Future: ~50-100ms (with network)
```

### Write Operations
```
db.json (current)           MongoDB (future)
│                           │
├─ fs.readFileSync()        ├─ Database write
├─ Array manipulation       ├─ Index update
├─ JSON.stringify()         ├─ Network I/O
├─ fs.writeFileSync()       └─ Transaction
└─ Blocking operation

Current: Blocks other requests
Future: Non-blocking with queue
```

---

## Security Notes

### Current Implementation (Development Only)
⚠️ localStorage stores user in plain JSON
⚠️ Passwords stored as plain text in db.json
⚠️ No HTTPS (use HTTP for development)
⚠️ No input sanitization (use DOMPurify for production)
⚠️ No rate limiting

### Production Requirements
✅ Use HTTPS/TLS encryption
✅ Bcrypt password hashing
✅ JWT with HttpOnly cookies
✅ CSRF protection
✅ Rate limiting
✅ Input validation & sanitization
✅ SQL/NoSQL injection prevention
✅ CORS configuration
✅ Helmet.js for security headers

---

## Testing Checklist

### Backend Tests
- [ ] Register: Validate all fields
- [ ] Register: Check duplicate email
- [ ] Register: Check duplicate username
- [ ] Register: Verify db.json is updated
- [ ] Login: Correct password
- [ ] Login: Incorrect password
- [ ] Login: Non-existent user
- [ ] Login: Role mismatch
- [ ] Get user: By ID
- [ ] Update user: Modify fields
- [ ] Delete user: Remove from db.json

### Frontend Tests
- [ ] Register form validation
- [ ] Register submission
- [ ] Login form validation
- [ ] Login submission
- [ ] localStorage persistence
- [ ] Route guard protection
- [ ] Profile display
- [ ] Profile edit
- [ ] Logout functionality
- [ ] Navigation based on role

---

## Deployment Checklist

### Before Production
- [ ] Switch to MongoDB
- [ ] Implement bcrypt hashing
- [ ] Enable JWT authentication
- [ ] Add HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Implement logging
- [ ] Add error monitoring
- [ ] Performance testing
- [ ] Security audit

---

## Summary

**Current State:** Development environment using db.json
**Use Case:** Rapid prototyping, testing, learning
**Not Recommended For:** Production, high concurrency, sensitive data

**Future State:** MongoDB + JWT + HTTPS
**Use Case:** Production deployment, scalability
**Recommended For:** Real-world applications
