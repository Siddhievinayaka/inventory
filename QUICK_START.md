# MERN Inventory Entry Portal - Complete Setup

This comprehensive MERN stack application is fully documented in `README.md`. 

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- OpenAI API key

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure Your Credentials** 
   Edit `client/.env.local`:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
   JWT_SECRET=your_jwt_secret_key_here_min_32_chars
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   OPENAI_API_KEY=sk-your_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

5. **Demo Credentials**
   - Email: `admin@store.com`
   - Password: `password123`

## Project Structure

All files are documented in `README.md`. Key directories:

- `client/app/` - Next.js App Router pages
- `client/components/` - Reusable React components
- `client/lib/` - Utilities and API client
- `server/` - Backend models and configuration

## Key Features

✅ Mobile-first design with camera support
✅ JWT authentication
✅ Product upload with image handling
✅ AI-powered descriptions and tags via OpenAI
✅ MongoDB integration with Mongoose
✅ Cloudinary image storage
✅ Responsive UI with Tailwind + shadcn/ui

## Complete File List

All files mentioned in the comprehensive README are ready to create. Follow the README sections:

1. **Phase 1** - Configuration files (package.json, tsconfig, tailwind)
2. **Phase 2** - Global styles and root layout
3. **Phase 3** - Core library files (db connection, JWT, Cloudinary, OpenAI)
4. **Phase 4** - Utility functions
5. **Phase 5** - UI components (Button, Input, Card, Modal, Toast)
6. **Phase 6** - Layout components (Header, ProtectedLayout)
7. **Phase 7** - API routes (auth, products, AI endpoints)
8. **Phase 8** - Product form and upload
9. **Phase 9** - Main pages (login, dashboard, add-product, listing)

## Build & Deployment

```bash
# Production build
npm run build
npm start

# Deploy to Vercel
vercel
# Set environment variables in Vercel dashboard
```

## API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product detail
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/products/upload` - Upload images
- `POST /api/ai/analyze` - Analyze product image
- `POST /api/ai/description` - Generate description
- `POST /api/ai/tags` - Generate tags

## Troubleshooting

**MongoDB Connection Error:**
- Verify MONGODB_URI in .env.local
- Check IP whitelist in MongoDB Atlas

**Cloudinary Upload Fails:**
- Verify CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
- Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

**OpenAI API Errors:**
- Verify OPENAI_API_KEY is valid
- Check your OpenAI account has credits

**Image Upload Not Working:**
- Ensure Cloudinary credentials are correct
- Check browser console for CORS issues

## Support

Refer to the complete `README.md` for detailed implementation of all files and components.
