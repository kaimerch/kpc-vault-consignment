'use client';

import { useEffect, useState } from 'react';

interface Client {
  id: string;
  fields: {
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Contract Status'?: string;
    'Contract Signed Date'?: string;
    'Street'?: string;
    'City'?: string;
    'State'?: string;
    'Zip Code'?: string;
  };
}

interface Item {
  id: string;
  fields: {
    'Title': string;
    'Description': string;
    'Status': string;
    'Client': string[];
    'Photos'?: Array<{ url: string; filename?: string; thumbnails?: { small?: { url: string }; large?: { url: string } } }>;
    'Estimated Value'?: number;
    'Is Specialty'?: boolean;
    'Sold Price'?: number;
    'Commission'?: number;
    'Client Payout'?: number;
  };
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string>('');
  const [updatingItem, setUpdatingItem] = useState<string>('');
  const [soldPriceInputs, setSoldPriceInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // This would normally be protected by authentication
      // For now, we'll create a simple admin API
      const response = await fetch('/api/admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendContract = async (clientId: string) => {
    setSending(clientId);
    
    try {
      // Get items for this client
      const clientItems = items.filter(item => 
        item.fields.Client && item.fields.Client.includes(clientId)
      );
      
      const itemIds = clientItems.map(item => item.id);
      
      if (itemIds.length === 0) {
        alert('No items found for this client');
        return;
      }

      // Generate contract
      const response = await fetch('/api/contract/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          itemIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate contract');
      }

      const data = await response.json();
      
      // Send contract email
      const emailResponse = await fetch('/api/contract/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientData: data.clientData,
          contractUrl: data.contractUrl
        })
      });

      if (emailResponse.ok) {
        alert(`Contract sent to ${data.clientData.email}`);
        loadData(); // Refresh data
      } else {
        // Fallback - show the contract URL
        const fallbackDiv = document.createElement('div');
        fallbackDiv.innerHTML = `
          <p>Contract generated! Share this link with the client:</p>
          <input type="text" value="${data.contractUrl}" style="width: 100%; padding: 8px; margin: 8px 0;" readonly />
          <button onclick="navigator.clipboard.writeText('${data.contractUrl}'); this.textContent='Copied!';" style="padding: 8px 16px;">Copy Link</button>
        `;
        
        const dialog = document.createElement('dialog');
        dialog.appendChild(fallbackDiv);
        document.body.appendChild(dialog);
        dialog.showModal();
        
        dialog.addEventListener('click', (e) => {
          if (e.target === dialog) {
            dialog.close();
            document.body.removeChild(dialog);
          }
        });
      }
      
    } catch (error) {
      alert('Failed to send contract. Please try again.');
      console.error(error);
    } finally {
      setSending('');
    }
  };

  const getContractStatus = (client: Client) => {
    const status = client.fields['Contract Status'];
    if (status === 'signed') {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">✅ Signed</span>;
    } else if (status === 'pending') {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">⏳ Pending</span>;
    } else {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">📄 Not Sent</span>;
    }
  };

  const STATUS_OPTIONS = [
    { value: 'pending', label: '🕐 Pending', color: 'bg-gray-100 text-gray-700' },
    { value: 'listed', label: '📋 Listed', color: 'bg-blue-100 text-blue-700' },
    { value: 'sold', label: '✅ Sold', color: 'bg-green-100 text-green-700' },
    { value: 'returned', label: '↩️ Returned', color: 'bg-red-100 text-red-700' },
  ];

  const updateItemStatus = async (itemId: string, newStatus: string) => {
    setUpdatingItem(itemId);
    try {
      const response = await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus })
      });
      if (!response.ok) throw new Error('Update failed');
      setItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, fields: { ...item.fields, 'Status': newStatus } }
          : item
      ));
    } catch (error) {
      alert('Failed to update status. Please try again.');
      console.error(error);
    } finally {
      setUpdatingItem('');
    }
  };

  const saveSoldPrice = async (item: Item) => {
    const raw = soldPriceInputs[item.id];
    const soldPrice = parseFloat(raw);
    if (isNaN(soldPrice) || soldPrice <= 0) {
      alert('Enter a valid sale price.');
      return;
    }
    setUpdatingItem(item.id);
    try {
      const response = await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          soldPrice,
          isSpecialty: item.fields['Is Specialty'] ?? false
        })
      });
      if (!response.ok) throw new Error('Update failed');
      const isSpecialty = item.fields['Is Specialty'] ?? false;
      let rate = 0.33;
      if (isSpecialty) rate = 0.35;
      else if (soldPrice >= 500) rate = 0.25;
      else if (soldPrice < 100) rate = 0.40;
      const commission = soldPrice * rate;
      const clientPayout = soldPrice - commission;
      setItems(prev => prev.map(i =>
        i.id === item.id
          ? { ...i, fields: { ...i.fields, 'Sold Price': soldPrice, 'Commission': commission, 'Client Payout': clientPayout } }
          : i
      ));
    } catch (error) {
      alert('Failed to save sold price. Please try again.');
      console.error(error);
    } finally {
      setUpdatingItem('');
    }
  };

  const getClientItems = (clientId: string) => {
    return items.filter(item => 
      item.fields.Client && item.fields.Client.includes(clientId)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KPC Vault Admin Dashboard</h1>
          <p className="text-gray-600">Manage clients and send consignment contracts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
            <div className="text-gray-600">Total Clients</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">
              {clients.filter(c => c.fields['Contract Status'] === 'signed').length}
            </div>
            <div className="text-gray-600">Contracts Signed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {clients.filter(c => c.fields['Contract Status'] === 'pending').length}
            </div>
            <div className="text-gray-600">Contracts Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-purple-600">{items.length}</div>
            <div className="text-gray-600">Total Items</div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Client Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => {
                  const clientItems = getClientItems(client.id);
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {client.fields['First Name']} {client.fields['Last Name']}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.fields['Street']}, {client.fields['City']}, {client.fields['State']}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.fields['Email']}</div>
                        <div className="text-sm text-gray-500">{client.fields['Phone']}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {clientItems.length} item(s)
                          {clientItems.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {clientItems.map(item => {
                                const photos = item.fields['Photos'] || [];
                                return (
                                  <div key={item.id} className="border border-gray-200 rounded-lg p-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="font-medium text-gray-800 text-xs">{item.fields['Title']}</div>
                                      <select
                                        value={item.fields['Status'] || 'pending'}
                                        onChange={(e) => updateItemStatus(item.id, e.target.value)}
                                        disabled={updatingItem === item.id}
                                        className={`text-xs px-2 py-0.5 rounded border-0 font-medium cursor-pointer disabled:opacity-50 ${
                                          STATUS_OPTIONS.find(s => s.value === (item.fields['Status'] || 'pending'))?.color || 'bg-gray-100 text-gray-700'
                                        }`}
                                      >
                                        {STATUS_OPTIONS.map(s => (
                                          <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Sold price input */}
                                    {item.fields['Status'] === 'sold' && (
                                      <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                                        {item.fields['Sold Price'] ? (
                                          <div className="text-xs space-y-0.5">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Sold for</span>
                                              <span className="font-bold text-gray-900">${item.fields['Sold Price'].toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Commission</span>
                                              <span className="text-red-600">-${item.fields['Commission']?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-green-200 pt-0.5 mt-0.5">
                                              <span className="font-bold text-gray-700">Client Payout</span>
                                              <span className="font-bold text-green-700">${item.fields['Client Payout']?.toFixed(2)}</span>
                                            </div>
                                            <button
                                              onClick={() => setSoldPriceInputs(p => ({ ...p, [item.id]: '' }))}
                                              className="text-xs text-blue-500 hover:underline mt-1"
                                            >Edit price</button>
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="text-xs font-medium text-gray-700 mb-1">Enter sale price:</div>
                                            <div className="flex gap-1">
                                              <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={soldPriceInputs[item.id] ?? ''}
                                                onChange={(e) => setSoldPriceInputs(p => ({ ...p, [item.id]: e.target.value }))}
                                                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded w-0"
                                              />
                                              <button
                                                onClick={() => saveSoldPrice(item)}
                                                disabled={updatingItem === item.id}
                                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                              >
                                                {updatingItem === item.id ? '...' : 'Save'}
                                              </button>
                                            </div>
                                            {soldPriceInputs[item.id] && !isNaN(parseFloat(soldPriceInputs[item.id])) && (() => {
                                              const sp = parseFloat(soldPriceInputs[item.id]);
                                              const isSpec = item.fields['Is Specialty'] ?? false;
                                              let rate = 0.33;
                                              if (isSpec) rate = 0.35;
                                              else if (sp >= 500) rate = 0.25;
                                              else if (sp < 100) rate = 0.40;
                                              const comm = sp * rate;
                                              const payout = sp - comm;
                                              return (
                                                <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                                                  <div className="flex justify-between">
                                                    <span>Commission ({(rate*100).toFixed(0)}%)</span>
                                                    <span className="text-red-500">-${comm.toFixed(2)}</span>
                                                  </div>
                                                  <div className="flex justify-between font-bold">
                                                    <span>Client Payout</span>
                                                    <span className="text-green-600">${payout.toFixed(2)}</span>
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {photos.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {photos.map((photo, pi) => (
                                          <a key={pi} href={photo.url} target="_blank" rel="noopener noreferrer">
                                            <img
                                              src={photo.thumbnails?.small?.url || photo.url}
                                              alt={`Photo ${pi + 1}`}
                                              className="w-16 h-16 object-cover rounded border border-gray-300 hover:opacity-80 transition-opacity"
                                            />
                                          </a>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400 italic">No photos</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getContractStatus(client)}
                        {client.fields['Contract Signed Date'] && (
                          <div className="text-xs text-gray-500 mt-1">
                            Signed: {client.fields['Contract Signed Date']}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {clientItems.length > 0 && client.fields['Contract Status'] !== 'signed' ? (
                          <button
                            onClick={() => sendContract(client.id)}
                            disabled={sending === client.id}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {sending === client.id ? '📧 Sending...' : '📧 Send Contract'}
                          </button>
                        ) : clientItems.length === 0 ? (
                          <span className="text-gray-400 text-sm">No items</span>
                        ) : (
                          <span className="text-green-600 text-sm">✅ Complete</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {clients.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>No clients found. Clients will appear here when consignment applications are submitted.</p>
              <a href="/consign" className="text-blue-600 hover:underline mt-2 inline-block">
                Test the consignment form →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}