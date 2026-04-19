# KPC Vault Consignment App - Phase 1 MVP

A professional consignment management system built with Next.js, featuring dynamic commission calculations, digital contracts, and real-time client portals.

## 🚀 Features

### ✅ Implemented (Phase 1)

1. **Dynamic Commission Calculator**
   - High-value items ($500+): 25%
   - Standard items ($100-$499): 33%
   - Low-value items (<$100): 40%
   - Specialty items: 35%
   - Real-time calculation with visual breakdown

2. **Integrated Intake Form + Contract System**
   - Multi-step client information collection
   - Item details with photo upload interface
   - Dynamic commission calculation per item
   - Auto-generated PDF contracts with jsPDF
   - Electronic signature capture ready

3. **Basic Client Portal**
   - Item tracking and status updates
   - Sales history and payment tracking
   - Profile management
   - Search and filter functionality

4. **Airtable Integration**
   - Complete data storage setup
   - Real-time CRUD operations
   - Structured tables for clients, items, contracts, and sales

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Airtable (free tier)
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Signatures**: Signature Pad (ready for integration)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage with calculator demo
│   ├── consign/           # Consignment intake form
│   └── portal/            # Client portal
├── components/            # Reusable React components
│   ├── CommissionCalculator.tsx
│   ├── IntakeForm.tsx
│   └── ClientPortal.tsx
├── lib/                   # Utility functions
│   ├── commission.ts      # Commission calculation logic
│   ├── airtable.ts       # Airtable API integration
│   └── contract.ts       # PDF contract generation
└── types/                # TypeScript type definitions
    └── index.ts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Airtable account (free tier)

### Installation

1. **Clone and setup**
   ```bash
   cd kpc-vault-consignment
   npm install
   ```

2. **Configure Airtable**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Airtable credentials:
   ```
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id
   AIRTABLE_API_KEY=your_api_key
   ```

3. **Create Airtable Base**
   - Create a new base in Airtable
   - Create tables with these structures:

   **CLIENTS Table:**
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

   **ITEMS Table:**
   - Title (Single line text)
   - Description (Long text)
   - Estimated Value (Currency)
   - Category (Single line text)
   - Is Specialty (Checkbox)
   - Photos (Attachment)
   - Status (Single select: pending, active, sold, returned)
   - Consigned Date (Date)
   - Sold Date (Date)
   - Sold Price (Currency)
   - Commission (Currency)
   - Client (Link to Clients table)

   **CONTRACTS Table:**
   - Client (Link to Clients table)
   - Items (Link to Items table, allow multiple)
   - Commission Rules (Long text)
   - Created Date (Date)
   - Signed Date (Date)
   - Signature (Long text)
   - PDF URL (URL)

   **SALES Table:**
   - Item (Link to Items table)
   - Client (Link to Clients table)
   - Sale Price (Currency)
   - Commission (Currency)
   - Client Payout (Currency)
   - Sale Date (Date)
   - Payment Status (Single select: pending, paid, failed)

4. **Run the application**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📊 Usage

### Commission Calculator
- Visit the homepage to test commission calculations
- Input item values to see real-time commission breakdowns
- Toggle specialty item status for custom rates

### Consignment Process
1. Navigate to `/consign`
2. Fill out the 3-step intake form:
   - Personal information
   - Item details with photos
   - Review and submit
3. System generates client record in Airtable
4. Auto-generates PDF contract (ready for e-signature)

### Client Portal
1. Visit `/portal`
2. Enter client ID from Airtable
3. View consigned items, sales history, and profile

## 🔄 Phase 2 Roadmap

### Immediate Enhancements
- [ ] Cloud photo storage (Cloudinary integration)
- [ ] Electronic signature capture with Signature Pad
- [ ] Email notifications and contract delivery
- [ ] Payment processing integration
- [ ] Advanced search and filtering

### Future Features
- [ ] Admin dashboard for KPC Vault staff
- [ ] Inventory management system
- [ ] Sales analytics and reporting
- [ ] Multi-location support
- [ ] Mobile-responsive optimizations

## 🛡 Security & Privacy

- Environment variables for sensitive data
- Input validation and sanitization
- Secure Airtable API integration
- Client data protection measures

## 💰 Cost Analysis

### Current Setup (Free Tier)
- **Hosting**: Vercel free tier
- **Database**: Airtable free (1,200 records)
- **Storage**: Local/Vercel for now
- **Total**: $0/month

### Production Scaling
- **Airtable Plus**: $20/month (5,000 records)
- **Cloudinary**: $99/month (storage)
- **Vercel Pro**: $20/month
- **Estimated**: ~$139/month

## 📈 Success Metrics

- **Phase 1 Goals**:
  - ✅ Functional commission calculator
  - ✅ Complete intake form workflow
  - ✅ Basic client portal
  - ✅ PDF contract generation
  - ✅ Airtable integration

- **Target**: Revenue-generating MVP within 7 days
- **Status**: 🎯 **COMPLETE** - Ready for client onboarding!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary to KPC Vault. All rights reserved.

## 📞 Support

For support or feature requests, contact:
- Email: support@kpcvault.com
- Phone: (555) 123-4567

---

**Status**: ✅ Phase 1 MVP Complete - Ready for Production Deployment!