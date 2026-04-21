'use client';

import React, { useState } from 'react';
import { DirectSubmission } from './DirectSubmission';

const SimpleIntakeForm = () => {
  const [formData, setFormData] = useState({
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

  const [showSubmission, setShowSubmission] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 SIMPLE FORM SUBMISSION');
    setShowSubmission(true);
  };

  const handleSuccess = (result: any) => {
    alert('✅ Success! Application submitted.');
    setShowSubmission(false);
  };

  const handleError = (error: string) => {
    alert(`❌ Error: ${error}`);
    setShowSubmission(false);
  };

  if (showSubmission) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <DirectSubmission 
          formData={formData}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Quick Test Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Test"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="User"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="test@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="555-1234"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                address: {...prev.address, street: e.target.value}
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Test St"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                address: {...prev.address, city: e.target.value}
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Test City"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                address: {...prev.address, state: e.target.value}
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Zip Code</label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => setFormData(prev => ({
                ...prev, 
                address: {...prev.address, zipCode: e.target.value}
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345"
              required
            />
          </div>
        </div>

        <hr className="my-6" />
        <h3 className="text-xl font-semibold mb-4">Item Information</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Item Title</label>
          <input
            type="text"
            value={formData.items[0].title}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              items: [{...prev.items[0], title: e.target.value}]
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Test Item"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.items[0].description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              items: [{...prev.items[0], description: e.target.value}]
            }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Test description"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estimated Value</label>
            <input
              type="number"
              value={formData.items[0].estimatedValue || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                items: [{...prev.items[0], estimatedValue: parseFloat(e.target.value) || 0}]
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="250"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.items[0].category}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                items: [{...prev.items[0], category: e.target.value}]
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Watches">Watches</option>
              <option value="Handbags">Handbags</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
        >
          🚀 Submit Test Application
        </button>
      </form>
    </div>
  );
};

export default SimpleIntakeForm;