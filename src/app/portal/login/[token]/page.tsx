'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle, XCircle, Loader } from 'lucide-react';
import Image from 'next/image';

export default function MagicLinkVerification() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = params.token as string;
        
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) {
          // Store session data
          sessionStorage.setItem('kpc_client_id', data.clientId);
          sessionStorage.setItem('kpc_email', data.email);
          
          setStatus('success');
          setMessage('Login successful! Redirecting to your portal...');
          
          // Redirect to portal after brief success message
          setTimeout(() => {
            router.push('/portal');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired login link');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify login link. Please try again.');
      }
    };

    if (params.token) {
      verifyToken();
    }
  }, [params.token, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image src="/kpc-vault-logo.svg" alt="KPC Vault" width={140} height={42} />
            </div>
            
            <div className="mb-4">
              {status === 'verifying' && (
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <Loader className="text-blue-600 animate-spin" size={32} />
                </div>
              )}
              
              {status === 'success' && (
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              )}
              
              {status === 'error' && (
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <XCircle className="text-red-600" size={32} />
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'verifying' && 'Verifying Login'}
              {status === 'success' && 'Login Successful!'}
              {status === 'error' && 'Login Failed'}
            </h1>
            
            <p className={`${
              status === 'success' ? 'text-green-600' : 
              status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {message}
            </p>
          </div>

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <Shield className="text-yellow-600 mr-3 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Security Tips</p>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      <li>• Magic links expire after 15 minutes</li>
                      <li>• Each link can only be used once</li>
                      <li>• Request a new link if this one has expired</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => router.push('/portal')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request New Login Link
                </button>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                <Loader className="animate-spin" size={16} />
                <span>Redirecting to your portal...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}