# KPC Vault Consignment App - IMMEDIATE Production Deployment

## 🚨 URGENT: Follow these steps to get live TODAY

### Step 1: Set Up Airtable Base (5 minutes)

1. **Go to [airtable.com](https://airtable.com) and create account/login**
2. **Create a new base called "KPC Vault Consignment"**
3. **Create 4 tables with EXACT field names and types:**

#### Table 1: "Clients"
- First Name (Single line text)
- Last Name (Single line text)  
- Email (Email)
- Phone (Phone number)
- Street (Single line text)
- City (Single line text)
- State (Single line text)
- Zip Code (Single line text)
- Total Earnings (Currency)
- Created Date (Date)

#### Table 2: "Items"
- Title (Single line text)
- Description (Long text)
- Estimated Value (Currency)
- Category (Single line text)
- Is Specialty (Checkbox)
- Photos (Long text) - Store URLs as comma-separated text
- Status (Single select: pending, active, sold, returned)
- Consigned Date (Date)
- Sold Date (Date)
- Sold Price (Currency)
- Commission (Currency)
- Client (Link to Clients table)

#### Table 3: "Contracts"
- Client (Link to Clients table)
- Items (Link to Items table, allow multiple)
- Commission Rules (Long text)
- Created Date (Date)
- Signed Date (Date)
- Signature (Long text)
- PDF URL (URL)

#### Table 4: "Sales"
- Item (Link to Items table)
- Client (Link to Clients table)
- Sale Price (Currency)
- Commission (Currency)
- Client Payout (Currency)
- Sale Date (Date)
- Payment Status (Single select: pending, paid, failed)

4. **Get your credentials:**
   - Copy Base ID from URL: https://airtable.com/[BASE_ID]/...
   - Generate API key: Account > Developer Hub > Personal Access Tokens > Create token
   - Give token access to your KPC Vault base with read/write permissions

### Step 2: Deploy to Vercel (3 minutes)

1. **Push to GitHub:**
   ```bash
   # The code is already committed, just need to push to GitHub
   # Create new repo at github.com/YOUR_USERNAME/kpc-vault-consignment
   git remote add origin https://github.com/YOUR_USERNAME/kpc-vault-consignment.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" 
   - Import your GitHub repository
   - **IMPORTANT: Before deploying, add environment variables:**

### Step 3: Configure Environment Variables in Vercel

In Vercel dashboard, go to Settings > Environment Variables and add:

```env
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here
AIRTABLE_API_KEY=your_airtable_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_COMPANY_NAME=KPC Vault
NEXT_PUBLIC_COMPANY_EMAIL=contact@kpcvault.com
NEXT_PUBLIC_COMPANY_PHONE=(555) 123-4567
```

3. **Click Deploy!**

### Step 4: Test Everything (2 minutes)

After deployment, test these URLs:
- `https://your-app.vercel.app` - Homepage with commission calculator
- `https://your-app.vercel.app/consign` - Intake form
- `https://your-app.vercel.app/portal` - Client portal

### Step 5: Custom Domain (Optional)

If you want app.kpcvault.com:
1. In Vercel dashboard: Settings > Domains
2. Add your domain
3. Update DNS records as instructed

## 🎯 FINAL URLS TO SHARE WITH CLIENTS

After deployment, you'll have:
- **Main Site:** `https://your-app.vercel.app`
- **Client Intake:** `https://your-app.vercel.app/consign`
- **Client Portal:** `https://your-app.vercel.app/portal`

## ⚡ REVENUE FEATURES LIVE TODAY

✅ **Commission Calculator** - Instant quotes for clients
✅ **Digital Intake Form** - Collect client info and items
✅ **Contract Generation** - PDF contracts with signatures
✅ **Client Portal** - Track items and earnings
✅ **Automated Data Storage** - Everything saves to Airtable

## 🚨 TROUBLESHOOTING

**Build fails?** 
- Check environment variables are exactly as shown above
- Make sure Airtable base and tables are created with exact names

**Can't connect to Airtable?**
- Verify Base ID and API key
- Ensure API token has read/write access to your base

**Need help?**
- Check Vercel deployment logs for errors
- Verify all table names match exactly (case sensitive)

## 💰 READY FOR CLIENTS!

Once deployed, Ernie can immediately:
1. Send clients to `/consign` to fill out intake forms
2. Use the commission calculator for instant quotes
3. Access all client data in Airtable
4. Generate and send contracts digitally

**Total setup time: ~10 minutes**
**Revenue generation: IMMEDIATE** 🚀