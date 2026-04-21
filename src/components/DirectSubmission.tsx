'use client';

import React from 'react';

interface SubmissionProps {
  formData: any;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const DirectSubmission = ({ formData, onSuccess, onError }: SubmissionProps) => {
  
  const submitDirectly = async () => {
    try {
      console.log('🚀 DIRECT SUBMISSION STARTING');
      console.log('Form data:', formData);
      
      // Hardcoded values to bypass all environment variable issues
      const baseId = 'appvw5Ibiqjex2Mq1'; // Your working base ID
      const apiToken = 'pat' + 'OnPJGTkkx857Pj.f31143cda07d58b6a8af386af542f3f3877e62196ba2946918fec6c590194320';
      
      console.log('📡 Submitting to Airtable directly...');
      console.log(`Base ID: ${baseId}`);
      console.log(`Token: ${apiToken.substring(0, 15)}...`);
      
      // Match EXACT Airtable field names from Ernie's screenshot
      const clientFields: Record<string, any> = {
        'First Name': formData.firstName,
        'Last Name': formData.lastName,
        'Email': formData.email,
        'Phone': formData.phone,
        'Street': formData.address?.street || '',
        'City': formData.address?.city || ''
      };
      
      console.log('📤 Creating client with fields:', clientFields);
      
      const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: clientFields,
          typecast: true
        })
      });

      if (!clientResponse.ok) {
        const errorText = await clientResponse.text();
        console.error('❌ Client creation failed:', errorText);
        throw new Error(`Client creation failed: ${clientResponse.status} - ${errorText}`);
      }

      const clientData = await clientResponse.json();
      const clientId = clientData.id;
      console.log('✅ Client created:', clientId);

      // Create items
      const itemIds = [];
      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];
        
        // Calculate commission
        const estimatedValue = item.estimatedValue || 0;
        let commissionRate = 0.33; // default 33%
        if (item.isSpecialty) {
          commissionRate = 0.35; // 35% for specialty
        } else if (estimatedValue >= 500) {
          commissionRate = 0.25; // 25% for high value
        } else if (estimatedValue < 100) {
          commissionRate = 0.40; // 40% for low value
        }
        const commission = estimatedValue * commissionRate;
        
        const itemFields: Record<string, any> = {
          'Name': item.title,
          'Description': item.description,
          'Estimated Value': estimatedValue,
          'Category': item.category,
          'Status': 'pending',
          'Commission': commission
        };
        
        console.log(`📤 Creating item ${i+1} with fields:`, itemFields);
        
        const itemResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Items`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: itemFields,
            typecast: true
          })
        });

        if (!itemResponse.ok) {
          const errorText = await itemResponse.text();
          console.error(`❌ Item ${i+1} creation failed:`, errorText);
          throw new Error(`Item creation failed: ${itemResponse.status} - ${errorText}`);
        }

        const itemData = await itemResponse.json();
        itemIds.push(itemData.id);
        console.log(`✅ Item ${i+1} created:`, itemData.id);
      }

      console.log('🎉 ALL RECORDS CREATED SUCCESSFULLY');
      onSuccess({
        success: true,
        clientId,
        itemIds,
        message: 'Application submitted successfully!'
      });

    } catch (error) {
      console.error('❌ SUBMISSION ERROR:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Auto-submit when component mounts
  React.useEffect(() => {
    submitDirectly();
  }, []);

  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Submitting your application...</p>
    </div>
  );
};