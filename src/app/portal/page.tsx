'use client';

import { useState, useEffect } from 'react';
import ClientPortal from '@/components/ClientPortal';
import DemoClientPortal from '@/components/DemoClientPortal';
import { Mail, User, Shield, Star, Loader, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function PortalPage() {
  const [email, setEmail] = useState('');
  const [clientId, setClientId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'clientId'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Check for existing session
  useEffect(() => {
    const savedClientId = sessionStorage.getItem('kpc_client_id');
    const savedEmail = sessionStorage.getItem('kpc_email');
    
    if (savedClientId && savedEmail) {
      setClientId(savedClientId);
      setEmail(savedEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    if (loginMethod === 'email') {
      try {
        const response = await fetch('/api/auth/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setMessage(data.message);
          setMessageType('success');
        } else {
          setMessage(data.error);
          setMessageType('error');
        }
      } catch (error) {
        setMessage('Failed to send magic link. Please try again.');
        setMessageType('error');
      }
    } else {
      // Direct client ID login
      const trimmedId = clientId.trim();
      if (trimmedId) {
        setIsLoggedIn(true);
      }
    }
    
    setIsLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center py-8">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image src="/kpc-vault-logo.svg" alt="KPC Vault" width={140} height={42} />
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-800" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Portal</h1>
              <p className="text-gray-600">Secure access to your consignment account</p>
              
              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mt-4">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('clientId')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    loginMethod === 'clientId'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Client ID
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <div className="flex items-center text-yellow-500">
                  <Star size={16} className="mr-1" />
                  <Star size={16} className="mr-1" />
                  <Star size={16} className="mr-1" />
                  <Star size={16} className="mr-1" />
                  <Star size={16} />
                  <span className="text-sm text-gray-600 ml-2">Trusted by 500+ clients</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              {loginMethod === 'email' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send you a secure login link via email
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter your client ID"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  messageType === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-start">
                    {messageType === 'success' ? (
                      <Mail className="mr-2 mt-0.5" size={16} />
                    ) : (
                      <AlertCircle className="mr-2 mt-0.5" size={16} />
                    )}
                    <span className="text-sm">{message}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-medium shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <Loader className="mr-2 animate-spin" size={18} />
                  ) : (
                    <Shield className="mr-2" size={18} />
                  )}
                  {isLoading
                    ? 'Sending...' 
                    : loginMethod === 'email'
                    ? 'Send Magic Link'
                    : 'Access Portal'
                  }
                </div>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-black text-center">
                Don't have your Client ID? 
                <br />
                <a href="mailto:Support@KPCVault.org" className="text-blue-600 hover:text-yellow-600 font-medium transition-colors">
                  Contact Support
                </a>
              </p>
            </div>

            {/* Demo section for testing */}
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="bg-yellow-100 rounded-full p-1 mr-3">
                  <Star className="text-yellow-600" size={14} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Demo Access</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Use <strong>demo@kpcvault.com</strong> or any Client ID to see the demo
                  </p>
                  <p className="text-xs text-gray-500">
                    Features: luxury item tracking, sales history, earnings dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Image src="/kpc-vault-logo.svg" alt="KPC Vault" width={120} height={36} />
            <button
              onClick={() => {
                setIsLoggedIn(false);
                sessionStorage.removeItem('kpc_client_id');
                sessionStorage.removeItem('kpc_email');
              }}
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClientPortal clientId={clientId} />
        </div>
      </div>
    </main>
  );
}