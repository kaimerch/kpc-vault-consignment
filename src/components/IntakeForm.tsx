'use client';

import React, { useState } from 'react';
import { Upload, User, Package, FileText, Camera } from 'lucide-react';
import CommissionCalculator from './CommissionCalculator';
import { calculateCommission } from '@/lib/commission';
import { AirtableService } from '@/lib/airtable';

interface FormData {
  // Client information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Item information
  items: Array<{
    title: string;
    description: string;
    estimatedValue: number;
    category: string;
    isSpecialty: boolean;
    photos: File[];
  }>;
}

const CATEGORIES = [
  'Jewelry', 'Watches', 'Handbags', 'Clothing', 'Shoes', 
  'Accessories', 'Art', 'Collectibles', 'Electronics', 'Other'
];

export default function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    items: [{
      title: '',
      description: '',
      estimatedValue: 0,
      category: '',
      isSpecialty: false,
      photos: []
    }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commissionCalculations, setCommissionCalculations] = useState<any[]>([]);

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const isArrayIndex = /^\d+$/.test(keys[i + 1]);
        if (isArrayIndex && !Array.isArray(current[key])) {
          current[key] = [];
        } else if (!isArrayIndex && typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        title: '',
        description: '',
        estimatedValue: 0,
        category: '',
        isSpecialty: false,
        photos: []
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handlePhotoUpload = (itemIndex: number, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      updateFormData(`items.${itemIndex}.photos`, fileArray);
    }
  };

  const calculateTotalCommissions = () => {
    return formData.items.reduce((total, item) => {
      const calc = calculateCommission(item.estimatedValue, item.isSpecialty);
      return {
        totalValue: total.totalValue + item.estimatedValue,
        totalCommission: total.totalCommission + calc.commission,
        totalPayout: total.totalPayout + calc.clientPayout
      };
    }, { totalValue: 0, totalCommission: 0, totalPayout: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Debug info first
      const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'appvw5Ibiqjex2Mq1';
      const apiToken = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN;
      
      console.log('Debug info:', {
        hasBaseId: !!baseId,
        baseId: baseId,
        hasApiToken: !!apiToken,
        tokenStart: apiToken ? apiToken.substring(0, 10) + '...' : 'null'
      });
      
      if (!apiToken) {
        throw new Error(`Airtable API token not configured. Environment check: BaseID=${baseId}, Token=${!!apiToken}`);
      }

      // Create client record directly from frontend
      const clientResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'First Name': formData.firstName,
            'Last Name': formData.lastName,
            'Email': formData.email,
            'Phone': formData.phone,
            'Street': formData.address.street,
            'City': formData.address.city,
            'State': formData.address.state,
            'Zip Code': formData.address.zipCode,
            'Total Earnings': 0,
            'Created Date': new Date().toISOString()
          }
        })
      });

      if (!clientResponse.ok) {
        const errorText = await clientResponse.text();
        throw new Error(`Failed to create client: ${clientResponse.status} - ${errorText}`);
      }

      const clientData = await clientResponse.json();
      const clientId = clientData.id;

      // Create items
      for (const item of formData.items) {
        const commission = calculateCommission(item.estimatedValue, item.isSpecialty);
        
        const itemResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Items`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              'Title': item.title,
              'Description': item.description,
              'Estimated Value': item.estimatedValue,
              'Category': item.category,
              'Is Specialty': item.isSpecialty,
              'Photos': '',
              'Status': 'pending',
              'Consigned Date': new Date().toISOString(),
              'Commission': commission.commission,
              'Client': [clientId]
            }
          })
        });

        if (!itemResponse.ok) {
          const errorText = await itemResponse.text();
          throw new Error(`Failed to create item: ${itemResponse.status} - ${errorText}`);
        }
      }

      // Create a fake response object for the existing success handling
      const response = { 
        ok: true, 
        json: () => Promise.resolve({ 
          success: true, 
          clientId,
          message: 'Application submitted successfully!' 
        }) 
      };

      const result = await response.json();
      
      // Show success message
      alert('Consignment application submitted successfully! You will receive an email confirmation shortly.');
      
      // Reset form
      setCurrentStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        items: [{
          title: '',
          description: '',
          estimatedValue: 0,
          category: '',
          isSpecialty: false,
          photos: []
        }]
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      alert(`There was an error submitting your application: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotalCommissions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Consignment Application</h2>
            <span className="text-sm text-black">Step {currentStep} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Client Information */}
          {currentStep === 1 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="text-blue-600" size={24} />
                <h3 className="text-xl font-semibold text-black">Your Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="First Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="Last Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => updateFormData('address.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next: Item Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Item Information */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Package className="text-blue-600" size={24} />
                  <h3 className="text-xl font-semibold text-black">Item Information</h3>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Another Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="mb-8 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">Item {index + 1}</h4>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Item Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateFormData(`items.${index}.title`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                        placeholder="Item Name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => updateFormData(`items.${index}.category`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateFormData(`items.${index}.description`, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                        placeholder="Detailed description of the item including condition, brand, model, etc."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Estimated Value</label>
                      <input
                        type="number"
                        value={item.estimatedValue || ''}
                        onChange={(e) => updateFormData(`items.${index}.estimatedValue`, parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={item.isSpecialty}
                          onChange={(e) => updateFormData(`items.${index}.isSpecialty`, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-black">Specialty Item (35% commission)</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-2">Photos</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-100">
                          <Camera size={20} />
                          <span>Upload Photos</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(index, e.target.files)}
                            className="hidden"
                          />
                        </label>
                        {item.photos.length > 0 && (
                          <span className="text-sm text-black">
                            {item.photos.length} photo(s) selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Commission preview for this item */}
                  {item.estimatedValue > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      {(() => {
                        const calc = calculateCommission(item.estimatedValue, item.isSpecialty);
                        return (
                          <div className="text-sm">
                            <span className="font-medium">Commission Preview:</span> {calc.percentage}% = ${calc.commission.toFixed(2)} | 
                            <span className="text-green-600 font-medium"> Your Payout: ${calc.clientPayout.toFixed(2)}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Review & Submit
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="text-blue-600" size={24} />
                <h3 className="text-xl font-semibold text-black">Review Your Application</h3>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Commission Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-black">Total Item Value</div>
                    <div className="font-bold">${totals.totalValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-black">Total Commission</div>
                    <div className="font-bold">${totals.totalCommission.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-black">Your Total Payout</div>
                    <div className="font-bold text-green-600">${totals.totalPayout.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Client Info Review */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Contact Information</h4>
                <p className="text-sm text-black">
                  {formData.firstName} {formData.lastName}<br />
                  {formData.email} | {formData.phone}<br />
                  {formData.address.street}, {formData.address.city}, {formData.address.state} {formData.address.zipCode}
                </p>
              </div>

              {/* Items Review */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Items ({formData.items.length})</h4>
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-black">
                      {item.category} | ${item.estimatedValue} | {item.photos.length} photo(s)
                      {item.isSpecialty && <span className="ml-2 text-purple-600">• Specialty Item</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
                <p className="text-sm text-black">
                  <strong>Next Steps:</strong> After submitting, you'll receive a digital contract via email for electronic signature. 
                  Once signed, we'll schedule item pickup or drop-off.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}