# 🎨 MERN Inventory Portal - Visual System Guide

Complete visual reference for the Inventory Entry Portal architecture, data flows, and component hierarchy.

---

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER (Mobile/Desktop)               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Login      │  │  Dashboard   │  │ Add Product  │  │   Products   ││
│  │   Page       │  │   Page       │  │   Page ⭐   │  │   Listing    ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  Components: Button | Input | Card | Modal | Form | Upload | Gallery   │
│                                                                          │
└───────────────────┬──────────────────────────────────────────────────────┘
                    │ Axios API Calls (JSON)
                    │ JWT Authorization
┌───────────────────▼──────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES (Backend)                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │  /auth/*       │  │  /products/*   │  │  /ai/*         │            │
│  │  - login       │  │  - GET all     │  │  - analyze     │            │
│  │  - verify      │  │  - GET one     │  │  - description │            │
│  │  [JWT tokens]  │  │  - POST create │  │  - tags        │            │
│  │                │  │  - PUT update  │  │[GPT-4/GPT-3.5]│            │
│  │                │  │  - DELETE      │  │                │            │
│  │                │  │  - upload      │  │                │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                          │
└───────────────────┬──────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬──────────────┐
        │           │           │              │
        ▼           ▼           ▼              ▼
    ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐
    │ MongoDB │ │Cloud    │ │ OpenAI  │ │ Node.js   │
    │ Atlas   │ │inary    │ │ API     │ │ Runtime   │
    └─────────┘ └─────────┘ └──────────┘ └───────────┘
```

---

## 📊 Database Schema Diagram

```
PRODUCTS Collection
┌─────────────────────────────────────────────────────┐
│ Product Document                                     │
├─────────────────────────────────────────────────────┤
│ _id: ObjectId (unique)                             │
│ sku: "SKU-7X91P2-AB5C3D" (unique, indexed)        │
│ title: "Antique Wooden Chair" (indexed)            │
│ category: "Furniture" (indexed)                    │
│ status: "Published" (indexed, enum)                │
│                                                     │
│ ┌─── Pricing ───┐                                  │
│ │ mrp: 5000     │                                  │
│ │ selling: 3500 │                                  │
│ │ quantity: 1   │                                  │
│ └───────────────┘                                  │
│                                                     │
│ ┌─── Details ───────────────────────┐             │
│ │ material: "Teak Wood"              │             │
│ │ dimensions: "100x50x45cm"          │             │
│ │ description: "..." (AI-generated) │             │
│ │ tags: ["antique", "wood", ...]    │             │
│ └────────────────────────────────────┘             │
│                                                     │
│ ┌─── Images ─────────────────────┐                │
│ │ [cloudinary_urls]               │                │
│ │ - https://res.cloudinary.com/..│                │
│ │ - https://res.cloudinary.com/..│                │
│ └─────────────────────────────────┘                │
│                                                     │
│ createdAt: 2024-01-15T10:30:00Z                   │
│ updatedAt: 2024-01-15T10:30:00Z                   │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Product Upload Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    User Opens Upload Page                            │
└────────────────────────────┬─────────────────────────────────────────┘
                             ▼
                   ┌──────────────────────┐
                   │  Select Images       │
                   │  • Camera            │
                   │  • File Upload       │
                   │  • Drag & Drop       │
                   └────────────┬─────────┘
                                ▼
                    ┌───────────────────────────┐
                    │ Upload to Cloudinary      │
                    │ • Compress if >2MB        │
                    │ • Generate URL            │
                    │ • Return secure URL       │
                    └─────────────┬─────────────┘
                                  ▼
                        ┌──────────────────┐
                        │ Fill Form        │
                        │ • Title          │
                        │ • Category       │
                        │ • Price          │
                        │ • Material       │
                        └────────┬─────────┘
                                 ▼
                    ┌────────────────────────────┐
                    │ Click "Generate AI..."     │
                    │ ├─ Analyze Image          │
                    │ ├─ Generate Description  │
                    │ └─ Generate Tags         │
                    │ [GPT-4/3.5 Processing]   │
                    └───────────┬────────────────┘
                                ▼
                    ┌────────────────────────┐
                    │ Form Auto-Filled       │
                    │ • Description          │
                    │ • Tags                 │
                    │ • (Optional) Title     │
                    └───────────┬────────────┘
                                ▼
                    ┌────────────────────────┐
                    │ User Reviews Form      │
                    │ • Edit if needed       │
                    │ • Set Status           │
                    └───────────┬────────────┘
                                ▼
                    ┌────────────────────────┐
                    │ Click "Save Product"   │
                    │ • Validate data        │
                    │ • POST to API          │
                    └───────────┬────────────┘
                                ▼
                    ┌────────────────────────┐
                    │ MongoDB Save           │
                    │ • Generate SKU         │
                    │ • Store all data       │
                    │ • Index fields         │
                    └───────────┬────────────┘
                                ▼
                    ┌────────────────────────┐
                    │ Success Response       │
                    │ • Show Toast           │
                    │ • Clear Form           │
                    │ • Navigate to List     │
                    └────────────────────────┘

⏱️ Total Time: < 30 seconds target
```

---

## 🔐 Authentication Flow

```
                    ┌─────────────────────────┐
                    │   User Visits /login    │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │  Enter Credentials      │
                    │  • Email                │
                    │  • Password             │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ POST /api/auth/login    │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Verify Credentials      │
                    │ • Check email           │
                    │ • Check password        │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Generate JWT Token      │
                    │ • Payload: user info    │
                    │ • Expires: 30 days      │
                    │ • Sign with secret      │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Return Token            │
                    │ {token: "eyJ..."}       │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Store in Cookies        │
                    │ • HttpOnly cookie       │
                    │ • 30 day expiry         │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Redirect /dashboard     │
                    │ • Set isAuthenticated   │
                    │ • Load protected route  │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ User In Dashboard       │
                    │ [Token sent with all]   │
                    │ [subsequent API calls]  │
                    └─────────────────────────┘

Protected Routes Middleware:
├─ Check for token in Authorization header
├─ Verify token signature
├─ Check expiration
├─ Extract user info
└─ Allow/deny based on validity
```

---

## 📊 Component Hierarchy

```
App Root (layout.tsx)
│
├─ ProtectedLayout (wrapper for authenticated pages)
│  ├─ Header
│  │  ├─ Logo
│  │  ├─ Navigation Links
│  │  └─ Logout Button
│  │
│  └─ Main Content
│     │
│     ├─ Dashboard Page (/dashboard)
│     │  ├─ Stats Cards
│     │  │  ├─ Total Count Card
│     │  │  ├─ Published Card
│     │  │  ├─ Draft Card
│     │  │  └─ Sold Card
│     │  └─ Recent Products
│     │
│     ├─ Add Product Page (/add-product) ⭐ MAIN FEATURE
│     │  └─ ProductForm
│     │     ├─ ImageUpload Component
│     │     │  ├─ Drag & Drop Area
│     │     │  ├─ File Input
│     │     │  └─ Camera Input
│     │     ├─ Form Sections
│     │     │  ├─ Basic Info (name, SKU, category)
│     │     │  ├─ Pricing (MRP, selling price)
│     │     │  ├─ Details (material, dimensions)
│     │     │  ├─ Description (with AI generation)
│     │     │  └─ Tags (with AI generation)
│     │     └─ Submit Buttons
│     │
│     ├─ Products List Page (/products)
│     │  ├─ Search Bar
│     │  ├─ Filters (category, status)
│     │  ├─ View Toggle (grid/table)
│     │  ├─ ProductGrid Component
│     │  │  └─ ProductCard (repeated)
│     │  └─ Pagination
│     │
│     └─ Product Details Page (/products/[id])
│        ├─ ImageGallery
│        │  └─ Image Thumbnails & Preview
│        ├─ Product Info Display
│        ├─ Edit Button
│        ├─ Mark as Sold Button
│        └─ Delete Button
│
└─ Public Pages (not protected)
   │
   └─ Login Page (/login)
      └─ LoginForm
         ├─ Email Input
         ├─ Password Input
         └─ Login Button
```

---

## 📡 API Request/Response Flow

```
CLIENT REQUEST:
┌──────────────────────────────────┐
│ POST /api/products               │
│ Authorization: Bearer <token>    │
│ Content-Type: application/json   │
│                                  │
│ {                                │
│   "title": "Chair",              │
│   "category": "Furniture",       │
│   "mrp": 5000,                   │
│   "sellingPrice": 3500,          │
│   "quantity": 1,                 │
│   "material": "Wood",            │
│   "images": ["https://..."],     │
│   "tags": ["antique"]            │
│ }                                │
└──────────────────────────────────┘
           ▼
┌──────────────────────────────────┐
│ API ROUTE PROCESSING             │
│ 1. Verify JWT token              │
│ 2. Validate input data           │
│ 3. Check required fields         │
│ 4. Generate unique SKU           │
│ 5. Create Product document       │
│ 6. Save to MongoDB               │
│ 7. Return created product        │
└──────────────────────────────────┘
           ▼
SERVER RESPONSE:
┌──────────────────────────────────┐
│ HTTP 201 Created                 │
│ Content-Type: application/json   │
│                                  │
│ {                                │
│   "_id": "507f...",              │
│   "sku": "SKU-ABC123",           │
│   "title": "Chair",              │
│   "status": "Draft",             │
│   "createdAt": "2024-01-15...",  │
│   "updatedAt": "2024-01-15..."   │
│ }                                │
└──────────────────────────────────┘
```

---

## 🎨 Page Flow Diagram

```
START
 │
 ▼
┌──────────────┐
│  Visit App   │
└────┬─────────┘
     │
     ▼
┌─────────────────┐     ┌──────────────┐
│  Authenticated? │ ──N─►│ Login Page   │
└────┬────────────┘     └──────┬───────┘
     │Y                        │
     │                    ┌────▼─────────┐
     │                    │ Submit Login  │
     │                    └────┬─────────┘
     │                         │
     │                         ▼
     │                    ┌────────────────┐
     │                    │ Get JWT Token  │
     │                    └────┬───────────┘
     │                         │
     │                    ┌────▼──────┐
     │                    │ Set Cookie │
     │                    └────┬──────┘
     │                         │
     └──────────┬──────────────┘
                ▼
        ┌──────────────────┐
        │ Dashboard Page   │ ◄─────┐
        └────┬──────────────┘       │
             │                       │
       ┌─────┴─────────┐            │
       │               │            │
       ▼               ▼            │
┌────────────────┐ ┌──────────────┐│
│ View Products  │ │ Add Product  ││
└────┬───────────┘ └──────┬───────┘│
     │                    │        │
     ▼                    ▼        │
┌──────────────┐  ┌────────────────┐
│ Products     │  │ Upload Form    │
│ List Page    │  │ • Select image │
│              │  │ • Fill form    │
│ • Search     │  │ • AI generate  │
│ • Filter     │  │ • Submit       │
│ • Sort       │  └────┬───────────┘
└────┬─────────┘       │
     │            ┌────▼──────┐
     │            │ Save to DB │
     │            └────┬──────┘
     │                 │
     │            ┌────▼─────────┐
     │            │ Success Toast │
     │            └────┬─────────┘
     │                 │
     └─────────────────┘
                │
                ▼
         ┌────────────────┐
         │ Product List   │
         │ (Refreshed)    │
         └────┬───────────┘
              │
              └─ [Edit] ──► Edit Product
              └─ [Delete] ─► Confirm & Delete
              └─ [View] ──► Product Details

[Logout] ─► Clear Cookie ─► Back to Login
```

---

## 🔌 API Endpoint Structure

```
BASE URL: /api

AUTH ROUTES
├── POST /auth/login
│   ├─ Request: {email, password}
│   └─ Response: {token}
│
└── GET /auth/verify
    ├─ Header: Authorization: Bearer <token>
    └─ Response: {valid, user}

PRODUCTS ROUTES
├── GET /products
│   ├─ Query: ?search=&category=&status=
│   └─ Response: [{product}, ...]
│
├── GET /products/:id
│   ├─ Param: id (MongoDB ObjectId)
│   └─ Response: {product}
│
├── POST /products
│   ├─ Body: {title, category, ...}
│   └─ Response: {_id, sku, ...}
│
├── PUT /products/:id
│   ├─ Param: id
│   ├─ Body: {fields to update}
│   └─ Response: {updated product}
│
├── DELETE /products/:id
│   ├─ Param: id
│   └─ Response: {message, _id}
│
└── POST /products/upload
    ├─ Form Data: files (multipart)
    └─ Response: {urls: []}

AI ROUTES
├── POST /ai/analyze
│   ├─ Body: {imageUrl}
│   └─ Response: {title, category, material, tags, description}
│
├── POST /ai/description
│   ├─ Body: {title, material, category}
│   └─ Response: {description}
│
└── POST /ai/tags
    ├─ Body: {title, description, category}
    └─ Response: {tags: []}
```

---

## 📱 Mobile-First Responsive Layout

```
DESKTOP (1024px+)          TABLET (640px-1024px)      MOBILE (<640px)

┌────────────────────┐    ┌──────────────────┐       ┌─────────────┐
│ Header             │    │ Header           │       │ Header      │
├────────────────────┤    ├──────────────────┤       ├─────────────┤
│ ┌────────────────┐ │    │ ┌──────────────┐ │       │ ☰ Menu      │
│ │                │ │    │ │              │ │       └─────────────┘
│ │   Main         │ │    │ │    Main      │ │       ┌─────────────┐
│ │   Content      │ │    │ │    Content   │ │       │ Main Content
│ │   (1-2 cols)   │ │    │ │  (1-2 cols)  │ │       │ (1 col)
│ │                │ │    │ │              │ │       │
│ │                │ │    │ │              │ │       │
│ └────────────────┘ │    │ └──────────────┘ │       └─────────────┘
│                    │    │                  │       ┌─────────────┐
│ Sidebar (optional) │    │ Buttons stacked  │       │ Footer      │
│                    │    │ Vertically       │       └─────────────┘
└────────────────────┘    └──────────────────┘

Form Inputs:
┌────────────────────────────────────┐
│ Label                              │
│ ┌──────────────────────────────────┐│ (100% width on mobile)
│ │ Input Field                      ││
│ └──────────────────────────────────┘│
└────────────────────────────────────┘

Buttons:
Desktop/Tablet: [Button 1] [Button 2]
Mobile:         [Button 1]
                [Button 2] (stacked)

Images:
Desktop: Grid 4 cols
Tablet:  Grid 3 cols
Mobile:  Grid 2 cols
```

---

## 🎯 User Journey Map

```
STAFF MEMBER WORKFLOW

Start → Browse → Upload → Fill → AI → Review → Save → Manage
App      Existing Details  Form   Help  Data   Data   List
        Products Product

↓        ↓       ↓         ↓      ↓      ↓      ↓      ↓
Login    View    See All   Quick  Auto   Check  Click  Search
         Stats   Details   Entry  Fill   Everything Save Find
         &       & Edit    >30s   Form   Correct Product
         Recent  Products  Target Fields         List

Time:    2s      5s       3s     5s     10s    3s     2s     Variable

This flow emphasizes SPEED - average product entry time: < 30 sec
```

---

## 🔄 Data Sync Cycle

```
OFFLINE CAPABILITY (Future Enhancement)

┌─ Online State
│  ├─ API calls to server
│  ├─ Store responses in cache
│  └─ Sync local DB
│
├─ Offline State
│  ├─ Use cached data
│  ├─ Queue new actions
│  └─ Show sync indicator
│
└─ Back Online
   ├─ Send queued actions
   ├─ Merge conflicts
   ├─ Update cache
   └─ Refresh UI
```

---

**All diagrams show the complete MERN Inventory Portal system flow. Refer to README.md for implementation details.**
