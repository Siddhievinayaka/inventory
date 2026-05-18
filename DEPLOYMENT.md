# Production Deployment Checklist

## Pre-Deployment Verification

### 1. Environment Variables
- [ ] MONGODB_URI set and tested
- [ ] JWT_SECRET (32+ characters, secure random string)
- [ ] CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET
- [ ] OPENAI_API_KEY with valid credits
- [ ] NEXTAUTH_SECRET (32+ characters)

### 2. Code Quality
- [ ] No `console.log` statements in production code
- [ ] Error handling implemented
- [ ] No hardcoded credentials
- [ ] TypeScript compilation successful
- [ ] ESLint checks pass

### 3. Build & Test
```bash
npm run build
npm run lint
npm test
```

### 4. Database
- [ ] MongoDB Atlas cluster created
- [ ] IP whitelist configured
- [ ] Database named "inventory-portal"
- [ ] Test connection successful

### 5. External Services
- [ ] Cloudinary account active
- [ ] Upload folder "inventory-portal" created
- [ ] OpenAI API key valid with credits
- [ ] API rate limits understood

### 6. Security
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] JWT token expiration set
- [ ] Admin credentials changed from defaults
- [ ] Sensitive files in .gitignore

### 7. Performance
- [ ] Image compression enabled
- [ ] Database indexes created
- [ ] API response times < 200ms
- [ ] Frontend bundle size < 500KB
- [ ] Lighthouse score > 80

### 8. Monitoring
- [ ] Error logging configured
- [ ] Analytics setup (optional)
- [ ] Uptime monitoring
- [ ] Database backup schedule

---

## Vercel Deployment Steps

1. **Connect Repository**
   - Push code to GitHub
   - Connect repo to Vercel

2. **Configure Environment**
   ```
   MONGODB_URI = <your_mongodb_uri>
   JWT_SECRET = <your_jwt_secret>
   NEXTAUTH_SECRET = <your_nextauth_secret>
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = <your_cloud_name>
   CLOUDINARY_API_KEY = <your_api_key>
   CLOUDINARY_API_SECRET = <your_api_secret>
   OPENAI_API_KEY = <your_openai_key>
   NEXT_PUBLIC_API_URL = <your_vercel_url>
   ```

3. **Deploy**
   - Vercel auto-deploys on push to main
   - Monitor build logs
   - Test in staging first

4. **Post-Deployment**
   - Run smoke tests
   - Verify API endpoints
   - Check image uploads
   - Test AI features

---

## Docker Deployment

```bash
# Build image
docker build -t inventory-portal:latest .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="..." \
  -e JWT_SECRET="..." \
  inventory-portal:latest

# Using docker-compose
docker-compose up -d
```

---

## Performance Optimization

- Enable Redis caching (optional)
- Implement database connection pooling
- Use CDN for static assets
- Enable gzip compression
- Optimize images with Cloudinary transformations
- Implement lazy loading

---

## Monitoring & Maintenance

- Monitor server health
- Check error logs daily
- Review API performance metrics
- Schedule database maintenance
- Update dependencies monthly
- Run security audits

---

## Rollback Procedure

```bash
# If deployment fails:
vercel rollback

# Or redeploy previous commit:
git revert <commit_hash>
git push
```

---

## Support & Troubleshooting

- Check Vercel logs: `vercel logs`
- Check MongoDB connection
- Verify Cloudinary credentials
- Test OpenAI API separately
- Monitor error tracking tool

---

For comprehensive setup instructions, see README.md and QUICK_START.md
