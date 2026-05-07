'use client';

import React, { useState, useEffect } from 'react';
import { User, Package, TrendingUp, DollarSign, Calendar, Search, Eye, Bell, Star } from 'lucide-react';
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'sales' | 'profile'>('items');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check for stored client ID from magic link login
    const storedClientId = clientId || sessionStorage.getItem('kpc_client_id');
    
    if (storedClientId) {
      loadClientData(storedClientId);
    }
  }, [clientId]);

  const loadClientData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch from secure server-side API
      const res = await fetch(`/api/portal?clientId=${encodeURIComponent(id)}`);
      
      if (res.ok) {
        const data = await res.json();
        
        // Parse dates from API response
        const clientData: Client = {
          ...data.client,
          items: []
        };
        
        const itemsData: Item[] = (data.items || []).map((item: any) => ({
          ...item,
          consignedDate: item.consignedDate ? new Date(item.consignedDate) : new Date(),
          soldDate: item.soldDate ? new Date(item.soldDate) : undefined
        }));
        
        const salesData: Sale[] = (data.sales || []).map((sale: any) => ({
          ...sale,
          saleDate: sale.saleDate ? new Date(sale.saleDate) : new Date()
        }));

        const notifData = (data.notifications || []).map((n: any) => ({
          ...n,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
        }));

        setClient(clientData);
        setItems(itemsData);
        setSales(salesData);
        setNotifications(notifData);
      } else {
        // API returned an error
        console.error('Portal API error:', res.status);
      }
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
      'returned': 'bg-gray-100 text-black'
    };
    return colors[status];
  };

  const getTotalStats = () => {
    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0);
    const soldItems = items.filter(item => item.status === 'sold');
    const totalSales = soldItems.reduce((sum, item) => sum + (item.soldPrice || 0), 0);
    const totalEarnings = soldItems.reduce((sum, item) => sum + (item.clientPayout || 0), 0);

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
        <p className="text-gray-500">Please check your client ID and try again.</p>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-100 to-yellow-100 rounded-full p-3 shadow-md">
              <User className="text-blue-800" size={24} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {client.firstName} {client.lastName}
              </h1>
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">{client.email}</span>
                <div className="flex text-yellow-400">
                  <Star size={14} />
                  <span className="text-xs text-gray-500 ml-1">Premium Client</span>
                </div>
              </p>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalEarnings)}
            </div>
            <div className="text-sm text-gray-600 mb-2">Total Earnings</div>
            <div className="flex space-x-2 justify-center lg:justify-end">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs hover:bg-gray-200 transition-colors flex items-center">
                <Bell size={12} className="mr-1" />
                Alerts
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Bell size={18} className="mr-2 text-blue-600" />
              Notifications
            </h3>
            <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg border ${
                    n.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={async () => {
                    if (!n.read) {
                      await fetch('/api/notifications/read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ notificationId: n.id })
                      });
                      setNotifications(prev =>
                        prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif)
                      );
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium text-sm ${n.read ? 'text-gray-700' : 'text-blue-800'}`}>{n.title}</p>
                      <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-400">{n.createdAt?.toLocaleDateString()}</p>
                      {!n.read && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">New</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3">
              <Package className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Items</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeItems}</p>
              <p className="text-xs text-gray-500 mt-1">Currently listed</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3">
              <TrendingUp className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sold Items</p>
              <p className="text-2xl font-bold text-green-600">{stats.soldItems}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.totalItems > 0 ? Math.round((stats.soldItems / stats.totalItems) * 100) : 0}% success rate
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-3">
              <DollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Revenue</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalEarnings)}</p>
              <p className="text-xs text-gray-500 mt-1">After commission</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full p-3">
              <Calendar className="text-yellow-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'items', label: 'My Items', icon: Package, count: stats.totalItems },
              { key: 'sales', label: 'Sales History', icon: DollarSign, count: stats.soldItems },
              { key: 'profile', label: 'Profile', icon: User }
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 py-4 border-b-3 font-medium text-sm transition-all ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {count !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" size={16} />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg w-16 h-16 flex items-center justify-center">
                          {item.photos.length > 0 ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
                                <Eye className="text-blue-600" size={20} />
                              </div>
                              <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 text-center">
                                {item.photos.length} photo{item.photos.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <Package className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span>
                            <span>Est. {formatCurrency(item.estimatedValue)}</span>
                            <span>{item.consignedDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status-specific info */}
                    {item.status === 'sold' && item.soldPrice && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 font-medium text-sm">Sold for</span>
                          <span className="text-green-600 font-semibold">{formatCurrency(item.soldPrice)}</span>
                        </div>
                        {item.commission !== undefined && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-500 text-sm">Commission</span>
                            <span className="text-gray-500 text-sm">-{formatCurrency(item.commission)}</span>
                          </div>
                        )}
                        {item.clientPayout !== undefined && (
                          <div className="flex justify-between items-center mt-1 border-t border-green-200 pt-1">
                            <span className="text-green-800 font-semibold text-sm">Your Payout</span>
                            <span className="text-green-700 font-bold">{formatCurrency(item.clientPayout)}</span>
                          </div>
                        )}
                        <div className="text-xs text-green-600 mt-1">
                          {item.soldDate && `Sold on ${item.soldDate.toLocaleDateString()}`}
                        </div>
                      </div>
                    )}
                    
                    {item.status === 'active' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-medium">Active Listing</span>
                          <button className="text-blue-600 text-xs hover:text-blue-800 flex items-center">
                            <Eye size={12} className="mr-1" />
                            View Listing
                          </button>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {Math.floor((new Date().getTime() - item.consignedDate.getTime()) / (1000 * 60 * 60 * 24))} days active
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">
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
                {items.filter(item => item.status === 'sold' && item.soldPrice).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">
                          {item.soldDate ? `Sold on ${item.soldDate.toLocaleDateString()}` : 'Sale date unavailable'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Sold for {formatCurrency(item.soldPrice!)}</div>
                        {item.commission !== undefined && (
                          <div className="text-sm text-gray-500">Commission: -{formatCurrency(item.commission)}</div>
                        )}
                        {item.clientPayout !== undefined && (
                          <div className="text-green-600 font-bold text-lg">Your Payout: {formatCurrency(item.clientPayout)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {items.filter(item => item.status === 'sold').length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No sales yet.</p>
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
                  <label className="block text-sm font-medium text-black mb-1">Name</label>
                  <p className="text-gray-900">{client.firstName} {client.lastName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email</label>
                  <p className="text-gray-900">{client.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Phone</label>
                  <p className="text-gray-900">{client.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Address</label>
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