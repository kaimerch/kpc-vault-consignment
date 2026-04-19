'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, TrendingUp, DollarSign, Calendar, Search } from 'lucide-react';
import { AirtableService } from '@/lib/airtable';
import { Client, Item, Sale } from '@/types';
import { formatCurrency } from '@/lib/commission';

interface ClientPortalProps {
  clientId?: string;
}

export default function ClientPortal({ clientId }: ClientPortalProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'sales' | 'profile'>('items');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (clientId) {
      loadClientData(clientId);
    }
  }, [clientId]);

  const loadClientData = async (id: string) => {
    try {
      setLoading(true);
      
      const [clientData, itemsData, salesData] = await Promise.all([
        AirtableService.getClient(id),
        AirtableService.getItemsByClient(id),
        AirtableService.getSalesByClient(id)
      ]);

      setClient(clientData);
      setItems(itemsData);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Item['status']) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-blue-100 text-blue-800',
      'sold': 'bg-green-100 text-green-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getTotalStats = () => {
    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0);
    const soldItems = items.filter(item => item.status === 'sold');
    const totalSales = soldItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
    const totalEarnings = sales.reduce((sum, sale) => sum + sale.clientPayout, 0);

    return {
      totalItems: items.length,
      activeItems: items.filter(item => item.status === 'active').length,
      soldItems: soldItems.length,
      totalValue,
      totalSales,
      totalEarnings
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Client Not Found</h3>
        <p className="text-gray-600">Please check your client ID and try again.</p>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {client.firstName} {client.lastName}
              </h1>
              <p className="text-gray-600">{client.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
            <Package className="text-gray-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Items</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeItems}</p>
            </div>
            <TrendingUp className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sold Items</p>
              <p className="text-2xl font-bold text-green-600">{stats.soldItems}</p>
            </div>
            <DollarSign className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalSales)}</p>
            </div>
            <Calendar className="text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'items', label: 'My Items', icon: Package },
              { key: 'sales', label: 'Sales History', icon: DollarSign },
              { key: 'profile', label: 'Profile', icon: User }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Consigned Items</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Category: {item.category}</span>
                          <span>Estimated Value: {formatCurrency(item.estimatedValue)}</span>
                          <span>Consigned: {item.consignedDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.status === 'sold' && item.soldPrice && (
                          <div className="text-green-600 font-semibold">
                            Sold: {formatCurrency(item.soldPrice)}
                          </div>
                        )}
                        {item.photos.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.photos.length} photo(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? 'No items found matching your search.' : 'No items consigned yet.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales History</h3>
              
              <div className="space-y-4">
                {sales.map((sale) => {
                  const item = items.find(i => i.id === sale.itemId);
                  return (
                    <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{item?.title || 'Unknown Item'}</h4>
                          <p className="text-sm text-gray-600">Sold on {sale.saleDate.toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{formatCurrency(sale.salePrice)}</div>
                          <div className="text-sm text-gray-600">
                            Commission: {formatCurrency(sale.commission)}
                          </div>
                          <div className="text-green-600 font-medium">
                            Your Payout: {formatCurrency(sale.clientPayout)}
                          </div>
                          <div className={`text-xs mt-1 ${
                            sale.paymentStatus === 'paid' ? 'text-green-600' : 
                            sale.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            Payment: {sale.paymentStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sales.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No sales yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{client.firstName} {client.lastName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{client.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{client.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">
                    {client.address.street}<br />
                    {client.address.city}, {client.address.state} {client.address.zipCode}
                  </p>
                </div>

                <div className="pt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}