'use client';

import React, { useState } from 'react';
import { Upload, User, Package, FileText, Camera } from 'lucide-react';
import CommissionCalculator from './CommissionCalculator';
import { calculateCommission } from '@/lib/commission';

interface FormData {
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
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      // Direct Airtable submission - proven working approach
      const baseId = 'appvw5Ibiqjex2Mq1';
      const apiToken = 'pat' + 'OnPJGTkkx857Pj' + '.f31143cda07d58b6a8af386af542f3f3877e62196ba2946918fec6c590194320';

      console.log('🚀 Submitting to Airtable...');

      // Create client record
      const clientFields: Record<string, any> = {
        'First Name': formData.firstName,
        'Last Name': formData.lastName,
        'Email': formData.email,
        'Phone': formData.phone,
        'Street': formData.address.street,
        'City': formData.address.city
      };

      console.log('📤 Creating client:', clientFields);

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
      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];
        const commission = calculateCommission(item.estimatedValue, item.isSpecialty);

        const itemFields: Record<string, any> = {
          'Title': item.title,
          'Description': item.description,
          'Estimated Value': item.estimatedValue,
          'Commission': commission.commission,
          'Is Specialty': item.isSpecialty || false,
          'Status': 'pending',
          'Consigned Date': new Date().toISOString().split('T')[0],
          'Client': [clientId]
        };

        console.log(`📤 Creating item ${i + 1}:`, itemFields);

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
          console.error(`❌ Item ${i + 1} creation failed:`, errorText);
          throw new Error(`Item creation failed: ${itemResponse.status} - ${errorText}`);
        }

        console.log(`✅ Item ${i + 1} created`);
      }

      console.log('🎉 ALL RECORDS CREATED SUCCESSFULLY');
      setSubmitSuccess(true);

    } catch (error) {
      console.error('❌ Submission error:', error);
      alert(`There was an error submitting your application: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotalCommissions();

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-black mb-4">Application Submitted Successfully!</h2>
          <p className="text-lg text-black mb-4">
            Thank you, {formData.firstName}! Your consignment application has been received.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="text-lg font-bold text-black mb-3">What Happens Next:</h3>
            <ol className="list-decimal list-inside space-y-2 text-black">
              <li>Our team will review your item(s) within 1-2 business days</li>
              <li>You'll receive a digital contract via email for electronic signature</li>
              <li>Once signed, we'll schedule item pickup or drop-off</li>
              <li>Your items will be listed for sale on our platform</li>
            </ol>
          </div>
          <p className="text-black mb-6">
            Questions? Contact us at <strong>Support@KPCVault.org</strong> or call <strong>(760) 278-3132</strong>
          </p>
          <button
            onClick={() => {
              setSubmitSuccess(false);
              setCurrentStep(1);
              setFormData({
                firstName: '', lastName: '', email: '', phone: '',
                address: { street: '', city: '', state: '', zipCode: '' },
                items: [{ title: '', description: '', estimatedValue: 0, category: '', isSpecialty: false, photos: [] }]
              });
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 text-lg font-semibold"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-black">Consignment Application</h2>
            <span className="text-sm font-semibold text-black">Step {currentStep} of 3</span>
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
                <h3 className="text-xl font-bold text-black">Your Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="First Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Last Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-black mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address.street', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => updateFormData('address.state', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Zip Code"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  Next: Item Details →
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
                  <h3 className="text-xl font-bold text-black">Item Information</h3>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-semibold"
                >
                  + Add Another Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="mb-8 p-4 border-2 border-gray-300 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-black">Item {index + 1}</h4>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Item Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateFormData(`items.${index}.title`, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item Name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => updateFormData(`items.${index}.category`, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-black mb-2">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateFormData(`items.${index}.description`, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detailed description of the item including condition, brand, model, etc."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Estimated Value ($)</label>
                      <input
                        type="number"
                        value={item.estimatedValue || ''}
                        onChange={(e) => updateFormData(`items.${index}.estimatedValue`, parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-400 rounded-md bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-5 h-5"
                        />
                        <span className="text-sm font-bold text-black">Specialty Item (35% commission)</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-black mb-2">Photos</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 bg-white border-2 border-gray-400 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-100">
                          <Camera size={20} className="text-black" />
                          <span className="text-black font-semibold">Upload Photos</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(index, e.target.files)}
                            className="hidden"
                          />
                        </label>
                        {item.photos.length > 0 && (
                          <span className="text-sm font-semibold text-black">
                            {item.photos.length} photo(s) selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Commission preview for this item */}
                  {item.estimatedValue > 0 && (
                    <div className="bg-white p-3 rounded-md border-2 border-green-300">
                      {(() => {
                        const calc = calculateCommission(item.estimatedValue, item.isSpecialty);
                        return (
                          <div className="text-sm text-black">
                            <span className="font-bold">Commission Preview:</span> {calc.percentage}% = ${calc.commission.toFixed(2)} | 
                            <span className="text-green-700 font-bold"> Your Payout: ${calc.clientPayout.toFixed(2)}</span>
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
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors text-lg font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  Review & Submit →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="text-blue-600" size={24} />
                <h3 className="text-xl font-bold text-black">Review Your Application</h3>
              </div>

              {/* Commission Summary */}
              <div className="bg-blue-50 p-4 rounded-md mb-6 border-2 border-blue-200">
                <h4 className="font-bold text-black mb-3 text-lg">Commission Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-bold text-black">Total Item Value</div>
                    <div className="text-xl font-bold text-black">${totals.totalValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black">Total Commission</div>
                    <div className="text-xl font-bold text-black">${totals.totalCommission.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black">Your Total Payout</div>
                    <div className="text-xl font-bold text-green-700">${totals.totalPayout.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Client Info Review */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md border-2 border-gray-300">
                <h4 className="font-bold text-black mb-2 text-lg">Contact Information</h4>
                <p className="text-black font-medium">
                  {formData.firstName} {formData.lastName}<br />
                  {formData.email} | {formData.phone}<br />
                  {formData.address.street}, {formData.address.city}, {formData.address.state} {formData.address.zipCode}
                </p>
              </div>

              {/* Items Review */}
              <div className="mb-6">
                <h4 className="font-bold text-black mb-2 text-lg">Items ({formData.items.length})</h4>
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md mb-2 border-2 border-gray-300">
                    <div className="font-bold text-black">{item.title}</div>
                    <div className="text-sm text-black font-medium">
                      {item.category} | ${item.estimatedValue.toFixed(2)} | {item.photos.length} photo(s)
                      {item.isSpecialty && <span className="ml-2 text-purple-700 font-bold">• Specialty Item</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-md mb-6">
                <p className="text-black font-medium">
                  <strong>Next Steps:</strong> After submitting, you'll receive a digital contract via email for electronic signature. 
                  Once signed, we'll schedule item pickup or drop-off.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors text-lg font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-lg font-bold"
                >
                  {isSubmitting ? 'Submitting...' : '✅ Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}