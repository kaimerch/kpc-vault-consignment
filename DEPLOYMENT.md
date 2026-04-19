# KPC Vault Consignment App - Deployment Guide

## 🚀 Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Airtable base setup completed

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial KPC Vault MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kpc-vault-consignment.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_AIRTABLE_BASE_ID`
     - `AIRTABLE_API_KEY`
     - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - Click "Deploy"

3. **Custom Domain (Optional)**
   - In Vercel dashboard, go to Domains
   - Add your custom domain (e.g., app.kpcvault.com)
   - Update DNS records as instructed

## 🔧 Environment Variables

### Required for Production
```env
NEXT_PUBLIC_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_COMPANY_NAME=KPC Vault
NEXT_PUBLIC_COMPANY_EMAIL=contact@kpcvault.com
NEXT_PUBLIC_COMPANY_PHONE=(555) 123-4567
```

### Optional (for enhanced features)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SENDGRID_API_KEY=your_sendgrid_key
```

## 📊 Airtable Setup Checklist

- [ ] Base created with correct name
- [ ] CLIENTS table with all required fields
- [ ] ITEMS table with all required fields
- [ ] CONTRACTS table with all required fields
- [ ] SALES table with all required fields
- [ ] API key generated with proper permissions
- [ ] Base ID copied from URL

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` files
   - Use Vercel's environment variables dashboard
   - Rotate API keys regularly

2. **Airtable Security**
   - Use restricted API keys when possible
   - Regularly review base permissions
   - Monitor API usage

3. **Client Data Protection**
   - Implement proper input validation
   - Consider data encryption for sensitive fields
   - Regular backups of Airtable data

## 📱 Mobile Optimization

The app is responsive and works on mobile devices. Key considerations:

- Touch-friendly signature pad
- Responsive design breakpoints
- Mobile photo upload optimization
- Simplified navigation on small screens

## 🧪 Testing Checklist

Before going live, test these scenarios:

### Commission Calculator
- [ ] High-value item ($500+) shows 25%
- [ ] Standard item ($100-$499) shows 33%
- [ ] Low-value item (<$100) shows 40%
- [ ] Specialty items show 35%
- [ ] Calculations are accurate

### Intake Form
- [ ] All form fields validate properly
- [ ] Photo upload interface works
- [ ] Multi-step navigation functions
- [ ] Form submission creates Airtable records
- [ ] PDF contract generation works

### Client Portal
- [ ] Client login with valid ID works
- [ ] Item listings display correctly
- [ ] Sales history shows properly
- [ ] Profile information is accurate
- [ ] Search and filtering function

## 🚨 Common Issues & Solutions

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Update dependencies
npm update
```

### Airtable Connection Issues
- Verify base ID and API key
- Check network connectivity
- Confirm table names match exactly
- Validate field names and types

### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run build:css
```

## 📈 Analytics & Monitoring

Consider adding:
- Google Analytics for user tracking
- Sentry for error monitoring
- Vercel Analytics for performance monitoring
- Custom metrics for business KPIs

## 🔄 Continuous Integration

### GitHub Actions (Optional)
Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 💰 Cost Monitoring

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 6,000 minutes build time
- **Airtable**: 1,200 records, 1,000 API calls/month
- **GitHub**: Unlimited public repos

### Upgrade Triggers
- Airtable: >1,000 records or >1,000 API calls
- Vercel: >100GB bandwidth or need advanced features
- Need: Custom domain, enhanced security features

## 📞 Support & Maintenance

### Regular Tasks
- [ ] Monitor Airtable usage
- [ ] Review error logs
- [ ] Update dependencies monthly
- [ ] Backup critical data
- [ ] Test functionality quarterly

### Emergency Contacts
- Vercel Support: support@vercel.com
- Airtable Support: support@airtable.com
- Developer: [Your contact info]

---

**Status**: Ready for Production Deployment 🚀