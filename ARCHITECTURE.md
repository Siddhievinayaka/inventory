# Architecture & Database Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js 15)                      │
├─────────────────────────────────────────────────────────────┤
│  Browser                                                      │
│  ├─ Pages (Login, Dashboard, Add Product, List, Details)   │
│  ├─ Components (UI, Forms, Shared)                          │
│  └─ Services (API Client, Auth, Hooks)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/API
┌───────────────────────▼─────────────────────────────────────┐
│                  BACKEND (Next.js API)                       │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                   │
│  ├─ /api/auth/* (Login, Verify)                            │
│  ├─ /api/products/* (CRUD)                                  │
│  └─ /api/ai/* (Analyze, Generate)                           │
└───────────────────────┬─────────────────────────────────────┘
                        │ 
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    ┌────────┐    ┌───────────┐  ┌──────────┐
    │MongoDB │    │Cloudinary │  │OpenAI    │
    │Atlas   │    │           │  │API       │
    └────────┘    └───────────┘  └──────────┘
```

## Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  sku: "SKU-7X91P2-AB5C3D" (Unique, Indexed),
  title: "Antique Wooden Chair",
  category: "Furniture",
  mrp: 5000,
  sellingPrice: 3500,
  quantity: 1,
  material: "Teak Wood",
  dimensions: "100cm x 50cm x 45cm",
  description: "Beautiful 19th century chair...",
  tags: ["antique", "wood", "furniture", "vintage"],
  status: "Published" (Draft|Review|Published|Sold),
  images: [
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## API Data Flow

### 1. Product Upload Flow
```
User Upload Form
  ↓
Image Upload → Cloudinary → Get URLs
  ↓
Fill Form Fields
  ↓
Click "Generate AI Description"
  ↓
OpenAI Analysis → Auto-fill Description
  ↓
Click "Generate AI Tags"
  ↓
OpenAI Generation → Auto-fill Tags
  ↓
Submit Form → MongoDB Save
  ↓
Success Toast + Navigate to List
```

### 2. Authentication Flow
```
Login Page
  ↓
POST /api/auth/login {email, password}
  ↓
Verify Credentials
  ↓
Generate JWT Token
  ↓
Return Token
  ↓
Store in Cookies
  ↓
Redirect to Dashboard
```

### 3. Image Upload Flow
```
Select Images
  ↓
Compress (if >2MB)
  ↓
Upload to Cloudinary
  ↓
Get Secure URLs
  ↓
Store URLs in Product Model
  ↓
Display Thumbnails
```

## Performance Optimization

### Image Optimization
- Compression: > 2MB files compressed to < 1MB
- Format: Auto-convert to WebP
- Responsive: Generate multiple sizes
- Lazy loading: Images loaded on scroll

### Database Optimization
- Indexes on: sku, title, category, status
- Connection pooling
- Query pagination (limit 50 per page)
- Caching frequently accessed data

### API Optimization
- Response compression
- Pagination for list endpoints
- Field selection (only needed fields)
- Rate limiting (100 req/min per IP)

## Security Measures

1. **Authentication**
   - JWT tokens expire after 30 days
   - Refresh tokens for extended sessions
   - Secure HTTP-only cookies

2. **Data Validation**
   - Input sanitization
   - Type checking with TypeScript
   - Schema validation with Mongoose

3. **API Security**
   - HTTPS only
   - CORS configured
   - Rate limiting
   - Request size limits

4. **File Upload Security**
   - File type validation
   - Size limits (10MB per image)
   - Virus scanning (future enhancement)
   - Secure storage on Cloudinary

5. **Secrets Management**
   - Environment variables
   - Never commit credentials
   - Rotate secrets regularly

## Scaling Considerations

### Current (Single Region)
- MongoDB Atlas shared cluster
- Single Next.js instance
- Cloudinary free tier

### Future Growth
- MongoDB Atlas dedicated cluster
- Multi-region deployment
- Redis caching layer
- CDN for static assets
- Separate auth service
- Message queue (Bull/RabbitMQ)

## Monitoring & Observability

- Error tracking: Sentry
- Performance monitoring: Vercel Analytics
- Database monitoring: MongoDB Atlas alerts
- API monitoring: Postman/Insomnia
- Logs: Vercel logs + CloudWatch

---

See DEPLOYMENT.md for production setup
See README.md for implementation details
