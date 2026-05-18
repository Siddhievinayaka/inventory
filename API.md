# API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://inventory-portal.vercel.app`

## Authentication

All endpoints except `/api/auth/login` require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /api/auth/login
Login with admin credentials and receive JWT token.

**Request:**
```json
{
  "email": "admin@store.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### GET /api/auth/verify
Verify if JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "email": "admin@store.com",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid token"
}
```

---

## Product Endpoints

### GET /api/products
List all products with optional filters.

**Query Parameters:**
- `search` (string) - Search by title
- `category` (string) - Filter by category
- `status` (string) - Filter by status (Draft|Review|Published|Sold)
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 50)

**Example:**
```
GET /api/products?search=chair&category=Furniture&status=Published&page=1
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "sku": "SKU-7X91P2-AB5C3D",
    "title": "Antique Wooden Chair",
    "category": "Furniture",
    "mrp": 5000,
    "sellingPrice": 3500,
    "quantity": 1,
    "material": "Teak Wood",
    "dimensions": "100cm x 50cm x 45cm",
    "description": "Beautiful 19th century chair with intricate carvings",
    "tags": ["antique", "wood", "furniture", "vintage"],
    "status": "Published",
    "images": ["https://res.cloudinary.com/..."],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### GET /api/products/:id
Get a single product by ID.

**Parameters:**
- `id` (string) - MongoDB ObjectId

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "sku": "SKU-7X91P2-AB5C3D",
  "title": "Antique Wooden Chair",
  ...
}
```

**Error (404):**
```json
{
  "error": "Product not found"
}
```

---

### POST /api/products
Create a new product.

**Request Body:**
```json
{
  "sku": "SKU-AUTO-GENERATED",
  "title": "Antique Wooden Chair",
  "category": "Furniture",
  "mrp": 5000,
  "sellingPrice": 3500,
  "quantity": 1,
  "material": "Teak Wood",
  "dimensions": "100cm x 50cm x 45cm",
  "description": "Beautiful 19th century chair",
  "tags": ["antique", "wood", "furniture"],
  "status": "Draft",
  "images": ["https://res.cloudinary.com/..."]
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "sku": "SKU-7X91P2-AB5C3D",
  ...
}
```

**Error (400):**
```json
{
  "error": "Validation failed",
  "details": {...}
}
```

---

### PUT /api/products/:id
Update an existing product.

**Parameters:**
- `id` (string) - MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "status": "Published",
  "quantity": 2,
  ...
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  ...
}
```

---

### DELETE /api/products/:id
Delete a product.

**Parameters:**
- `id` (string) - MongoDB ObjectId

**Response (200 OK):**
```json
{
  "message": "Product deleted",
  "_id": "507f1f77bcf86cd799439011"
}
```

---

### POST /api/products/upload
Upload images to Cloudinary.

**Request:**
- Form data with `files` field (multiple)
- Max 5 files per request
- Max 10MB per file

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/products/upload \
  -H "Authorization: Bearer <token>" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

**Response (200 OK):**
```json
{
  "urls": [
    "https://res.cloudinary.com/...image1.jpg",
    "https://res.cloudinary.com/...image2.jpg"
  ]
}
```

**Error (400):**
```json
{
  "error": "File size exceeds limit"
}
```

---

## AI Endpoints

### POST /api/ai/analyze
Analyze a product image using GPT-4 Vision.

**Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/.../image.jpg"
}
```

**Response (200 OK):**
```json
{
  "title": "Wooden Chair",
  "category": "Furniture",
  "material": "Teak Wood",
  "tags": ["wood", "antique", "furniture", "chair"],
  "description": "A vintage wooden chair with detailed carvings"
}
```

**Error (400):**
```json
{
  "error": "Invalid image URL"
}
```

---

### POST /api/ai/description
Generate a product description.

**Request Body:**
```json
{
  "title": "Antique Wooden Chair",
  "material": "Teak Wood",
  "category": "Furniture",
  "description": "Existing description (optional)"
}
```

**Response (200 OK):**
```json
{
  "description": "A beautiful 19th-century teak wood chair featuring intricate hand-carved details..."
}
```

---

### POST /api/ai/tags
Generate product tags.

**Request Body:**
```json
{
  "title": "Antique Wooden Chair",
  "description": "A beautiful chair with carvings",
  "category": "Furniture"
}
```

**Response (200 OK):**
```json
{
  "tags": ["antique", "wood", "furniture", "chair", "vintage", "handcrafted", "decor"]
}
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format/validation |
| 401 | Unauthorized | Provide valid JWT token |
| 404 | Not Found | Check resource ID |
| 409 | Conflict | SKU already exists |
| 429 | Too Many Requests | Rate limited, wait & retry |
| 500 | Server Error | Check logs, retry later |

---

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per IP

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## Request/Response Format

### Standard Success Response
```json
{
  "data": {...},
  "success": true
}
```

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

---

## Examples

### Complete Product Upload Flow
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@store.com","password":"password123"}'

# Response: {"token": "eyJhbGciOi..."}

# 2. Upload image
curl -X POST http://localhost:3000/api/products/upload \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -F "files=@chair.jpg"

# Response: {"urls": ["https://res.cloudinary.com/.../chair.jpg"]}

# 3. Analyze image
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://res.cloudinary.com/.../chair.jpg"}'

# Response: {"title":"Wooden Chair","category":"Furniture",...}

# 4. Create product
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Antique Wooden Chair",
    "category":"Furniture",
    "mrp":5000,
    "sellingPrice":3500,
    "quantity":1,
    "material":"Teak Wood",
    "images":["https://res.cloudinary.com/.../chair.jpg"]
  }'

# Response: {"_id":"507f1f77bcf86cd799439011",...}
```

---

## Testing with Postman

Import this collection:
```json
{
  "info": {
    "name": "Inventory Portal API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/auth/login"
      }
    }
  ]
}
```

---

## WebSocket (Future Enhancement)

Real-time product updates:
```javascript
const ws = new WebSocket('wss://inventory-portal.vercel.app/api/products/stream');

ws.onmessage = (event) => {
  const { action, product } = JSON.parse(event.data);
  // action: 'created' | 'updated' | 'deleted'
};
```

---

See README.md for implementation details.
