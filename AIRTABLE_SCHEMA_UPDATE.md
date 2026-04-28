# Airtable Schema Update for Digital Contracts

To enable the digital contract functionality, you need to add these fields to your Airtable base:

## Clients Table - Add These Fields:

1. **Contract Token** (Single Line Text)
   - Stores the secure token for contract signing links

2. **Contract Status** (Single Select)
   - Options: `pending`, `signed`, `expired`
   - Default: (blank)

3. **Contract Signed Date** (Date)
   - Automatically filled when contract is signed

4. **Signature Data** (Long Text)
   - Stores the base64 signature image data

5. **Contract PDF** (Attachment)
   - Stores the signed contract PDF

## How to Add These Fields:

1. **Open your Airtable base:** [https://airtable.com/appvw5Ibiqjex2Mq1](https://airtable.com/appvw5Ibiqjex2Mq1)

2. **Go to the Clients table**

3. **Add each field:**
   - Click the "+" next to your last column
   - Select the field type from the list above
   - Name it exactly as shown
   - For "Contract Status", add the options: pending, signed, expired

4. **Save the base**

## Test the System:

After adding these fields:

1. **Go to admin dashboard:** `/admin`
2. **Find a client with items**
3. **Click "Send Contract"**
4. **Check the contract signing flow**

## Email Configuration:

Make sure to update your `.env.local` with a real Resend API key:
```
RESEND_API_KEY=re_your_actual_api_key_here
```

Get your API key from: [https://resend.com/api-keys](https://resend.com/api-keys)

## Production Deployment:

When ready to go live:
1. Update `NEXT_PUBLIC_BASE_URL` to your actual domain
2. Set up proper authentication for `/admin`
3. Configure your domain with Resend for email sending
4. Test the complete flow with a real client

## Security Notes:

- Contract links expire after 24 hours
- Admin dashboard currently uses basic password protection
- All signatures are legally compliant with California Electronic Transactions Act
- PDF copies are automatically generated and stored securely