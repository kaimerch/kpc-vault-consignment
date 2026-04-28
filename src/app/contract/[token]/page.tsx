'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import SignaturePad from 'signature_pad';

// Handle Next.js params properly
function useToken() {
  const params = useParams();
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (params && params.token) {
      // Handle both sync and async params
      if (typeof params.token === 'string') {
        setToken(params.token);
      } else if (Array.isArray(params.token)) {
        // Handle array case (shouldn't happen for [token] route but TypeScript requires it)
        setToken(params.token[0] || null);
      } else {
        // Handle Promise-based params in newer Next.js
        Promise.resolve(params.token).then((resolvedToken) => {
          if (typeof resolvedToken === 'string') {
            setToken(resolvedToken);
          } else if (Array.isArray(resolvedToken)) {
            setToken(resolvedToken[0] || null);
          }
        });
      }
    }
  }, [params]);
  
  return token;
}

interface ClientData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ItemData {
  title: string;
  description: string;
  estimatedValue: number;
}

export default function ContractPage() {
  const contractToken = useToken();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [signing, setSigning] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initializeSignaturePad = () => {
      if (canvasRef.current) {
        try {
          console.log('Initializing signature pad...');
          const canvas = canvasRef.current;
          
          // Clear any existing signature pad
          if (signaturePad) {
            signaturePad.clear();
          }
          
          // Get the actual display size
          const rect = canvas.getBoundingClientRect();
          console.log('Canvas rect:', rect);
          
          // Set canvas size to match display size exactly
          canvas.width = rect.width;
          canvas.height = rect.height;
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';
          
          // Initialize SignaturePad with proper config
          const pad = new SignaturePad(canvas, {
            backgroundColor: 'white',
            penColor: 'black',
            minWidth: 1,
            maxWidth: 2.5
          });
          
          setSignaturePad(pad);
          console.log('Signature pad initialized successfully with dimensions:', canvas.width, 'x', canvas.height);
          
        } catch (error) {
          console.error('Error initializing signature pad:', error);
        }
      } else {
        console.log('Canvas ref not ready, retrying...');
        setTimeout(initializeSignaturePad, 100);
      }
    };
    
    // Initialize after a short delay
    setTimeout(initializeSignaturePad, 200);
    
    // Also reinitialize on window resize
    const handleResize = () => {
      setTimeout(initializeSignaturePad, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (contractToken) {
      loadContractData();
    }
  }, [contractToken]);

  const loadContractData = async () => {
    if (!contractToken) {
      setError('No contract token provided');
      setLoading(false);
      return;
    }
    
    try {
      // Decode token to get client and item data
      const decoded = Buffer.from(contractToken, 'base64').toString();
      const tokenData = JSON.parse(decoded);
      
      // Check if expired
      if (Date.now() > tokenData.expires) {
        setError('This contract link has expired. Please contact KPC Vault for a new link.');
        setLoading(false);
        return;
      }

      // Fetch contract data
      const response = await fetch('/api/contract/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: tokenData.clientId,
          itemIds: tokenData.itemIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load contract data');
      }

      const data = await response.json();
      setClientData(data.clientData);
      setItemsData(data.itemsData);
      
    } catch (error) {
      setError('Invalid or expired contract link');
    } finally {
      setLoading(false);
    }
  };

  const clearSignature = () => {
    signaturePad?.clear();
  };

  const handleSign = async () => {
    console.log('Sign button clicked');
    console.log('Signature pad:', signaturePad);
    console.log('Consent given:', consentGiven);
    
    if (!contractToken) {
      alert('Contract token is missing. Please refresh and try again.');
      return;
    }
    
    if (!signaturePad || !consentGiven) {
      alert('Please provide consent and signature before proceeding.');
      return;
    }

    if (signaturePad.isEmpty()) {
      alert('Please provide your signature.');
      return;
    }

    setSigning(true);

    try {
      const signatureData = signaturePad.toDataURL();
      const timestamp = new Date().toISOString();
      
      console.log('Attempting to sign contract...');
      
      // Skip IP lookup for now to avoid external API issues
      const response = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractToken,
          signatureData,
          clientInfo: clientData,
          consentGiven,
          timestamp,
          ipAddress: 'localhost' // Simplified for testing
        })
      });

      console.log('Sign response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Sign error:', errorData);
        throw new Error(errorData.error || 'Failed to sign contract');
      }

      const result = await response.json();
      console.log('Sign success:', result);
      alert('Contract signed successfully! PDF copies have been sent to your email.');
      
      // Redirect to success page or show success message
      window.location.href = '/contract/success';
      
    } catch (error) {
      console.error('Signing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to sign contract: ${errorMessage}`);
    } finally {
      setSigning(false);
    }
  };

  if (loading || !contractToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="/consign" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Start New Application
          </a>
        </div>
      </div>
    );
  }

  const itemsDescription = itemsData.map(item => item.title).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-8 text-center">
          <h1 className="text-3xl font-bold">KPC Vault Consignment Agreement</h1>
          <p className="mt-2">Contact: 760-278-3132 | Dana@kpcvault.org</p>
        </div>

        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to KPC Vault</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-gray-700 leading-relaxed">
                Thank you for choosing KPC Vault. We help clients turn quality items into cash through a clear, 
                documented consignment process. Here is how the process works: you provide the item, we photograph 
                and list it, we manage pricing and the sale, and then we issue your payout under the agreed terms.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                For this agreement, the stated business terms are a <strong className="text-blue-700">33% commission to KPC Vault</strong> and 
                payment to the consignor <strong className="text-blue-700">no later than 30 days after the item sells</strong>, after the 
                applicable buyer return window closes and funds are secured.
              </p>
              <p className="text-sm text-gray-600 mt-4 italic">
                This agreement includes the full consignment terms, intake selections, pricing controls, and receipt section 
                so expectations are documented from the start.
              </p>
            </div>
          </div>

          {/* Client Information */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Client Name:</strong> {clientData?.name}
              </div>
              <div>
                <strong>Phone Number:</strong> {clientData?.phone}
              </div>
              <div>
                <strong>Email Address:</strong> {clientData?.email}
              </div>
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
              <div className="md:col-span-2">
                <strong>Address:</strong> {clientData?.address}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Consigned Items</h2>
            <p><strong>Items:</strong> {itemsDescription}</p>
            <p className="text-sm text-gray-600 mt-2">
              By signing, you confirm that you are the rightful owner of these items, that no one else has a 
              claim to them, that they are authentic to the best of your knowledge, and that you obtained them legally.
            </p>
          </div>

          {/* Full Consignment Agreement */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Full Consignment Agreement</h2>
            <div className="space-y-4 text-gray-800 text-sm leading-relaxed">
              
              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">1. Purpose</h3>
                <p>Consignor appoints KPC Vault to market and sell the personal property described in this Agreement on a consignment basis.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">2. Description of Goods</h3>
                <p>This Agreement covers the following items: <strong>{itemsDescription}</strong>, along with any accessories, parts, or related materials listed in the intake section. By signing, you confirm that you are the rightful owner of these items, that no one else has a claim to them, that they are authentic to the best of your knowledge, and that you obtained them legally.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">3. Term</h3>
                <p>This Agreement begins on the date signed and continues until the Goods are sold, returned, or this Agreement is otherwise terminated. The parties may extend the arrangement by written agreement.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">4. Pricing & Sales Authority</h3>
                <p>KPC Vault may determine the initial listing price, sales platform, listing format, and pricing adjustments based on market conditions unless specific pricing limits are selected in the intake section. Consignor authorizes reasonable markdowns if discount permission or an automatic price-drop timeline is approved.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">5. Commission & Payment</h3>
                <p><strong>KPC Vault shall retain 33% of the gross sale price as commission, and Consignor shall receive 67% of the gross sale price</strong>, less any agreed deductions such as approved shipping, handling, storage, or platform-related charges. <strong>Payment to Consignor will be issued no later than 30 days after the item sells</strong>, after the applicable buyer return window has closed and sale funds are secured.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">6. Returns & Chargebacks</h3>
                <p>If a buyer returns the item, files a payment dispute, or initiates a chargeback, the sale will be treated as incomplete until resolved. KPC Vault may withhold, delay, adjust, or reverse any payout connected to that transaction. Consignor accepts the risk of buyer returns and platform disputes to the extent permitted by law.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">7. Fees</h3>
                <p>Storage fees may apply to unsold or unclaimed Goods remaining in KPC Vault's possession beyond a designated grace period. If storage fees apply, the grace period length, fee amount, and billing frequency will be specified in the Item Intake section. Storage fees not documented in the intake section do not apply. Consignor will be notified before storage charges begin.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">8. Risk of Loss & Insurance</h3>
                <p>KPC Vault will use reasonable care in handling the Goods. <strong>Risk of loss remains with Consignor unless loss or damage is caused by KPC Vault's gross negligence or willful misconduct.</strong> KPC Vault does not provide insurance unless explicitly agreed in writing.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">9. Unsold & Unclaimed Property</h3>
                <p>If the Goods remain unsold or if this Agreement is terminated, KPC Vault will notify the Consignor in writing (via email or text to the contact information provided) that the Goods are available for pickup. <strong>Consignor must retrieve the Goods within 14 days of that notice.</strong> If Goods are not retrieved within the 14-day pickup window, storage fees may begin to apply. If Goods remain unclaimed for 30 or more days after the initial retrieval notice, KPC Vault may sell, donate, or dispose of the Goods to recover any outstanding costs, as permitted by applicable California law.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">10. Termination</h3>
                <p>Either party may terminate this Agreement by written notice. Upon termination, unsold Goods must be retrieved within the stated pickup period, and any outstanding approved fees must be paid before release.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">11. Limitation of Liability</h3>
                <p>To the fullest extent permitted under California law, KPC Vault will not be liable for indirect, incidental, special, or consequential damages. Total liability, if any, will not exceed the expected net proceeds of the consigned item.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">12. Indemnification</h3>
                <p>Consignor agrees to defend, indemnify, and hold harmless KPC Vault from claims, losses, liabilities, and expenses arising from ownership disputes, authenticity disputes, legal violations, or inaccuracies in Consignor's representations regarding the Goods.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">13. Compliance with California Law</h3>
                <p>Both parties agree to comply with applicable California laws, including consumer protection requirements, resale-related rules, and applicable tax reporting obligations.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">14. Governing Law & Venue</h3>
                <p>This Agreement is governed by the laws of the State of California. Any dispute arising from this Agreement shall be resolved in the appropriate courts located in California, unless otherwise required by law.</p>
              </div>

              <div className="p-4 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">15. Entire Agreement</h3>
                <p>This agreement, including the intake selections and any attached inventory, constitutes the entire agreement between the parties and supersedes prior discussions regarding this consignment arrangement.</p>
              </div>
            </div>
          </div>

          {/* Digital Signature Section */}
          <div className="border-2 border-gray-300 rounded-lg p-6 bg-blue-50">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🖊️ Digital Signature</h2>
            
            {/* Electronic Consent */}
            <div className="mb-6 p-4 bg-blue-100 rounded border">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1"
                  required
                />
                <span className="text-sm">
                  <strong>I agree to sign this contract electronically</strong> and acknowledge that my 
                  electronic signature will have the same legal effect as a handwritten signature under 
                  California Electronic Transactions Act (Civil Code Section 1633).
                </span>
              </label>
            </div>

            {/* Signature Canvas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Signature:
              </label>
              <div className="border-2 border-gray-300 rounded bg-white">
                <canvas
                  ref={canvasRef}
                  className="bg-white rounded cursor-crosshair block"
                  style={{ 
                    touchAction: 'none',
                    width: '100%',
                    height: '150px',
                    display: 'block'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">📝 Click and drag to sign above</p>
              <div className="flex space-x-4 mt-3">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear Signature
                </button>
                <button
                  type="button"
                  onClick={handleSign}
                  disabled={!consentGiven || signing}
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
                >
                  {signing ? 'Signing...' : '📝 Sign & Save Contract'}
                </button>
              </div>
            </div>

            {/* Signature Metadata */}
            <div className="text-xs text-gray-500 bg-white p-3 rounded border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Signed by:</strong> {clientData?.name}<br />
                  <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
                  <strong>Time:</strong> {new Date().toLocaleTimeString()}
                </div>
                <div>
                  <strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}<br />
                  <strong>Platform:</strong> {navigator.platform}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
            <p><em>This contract is digitally signed and legally binding under California Electronic Transactions Act</em></p>
            <p className="font-semibold">KPC Vault | 760-278-3132 | Dana@kpcvault.org</p>
          </div>
        </div>
      </div>
    </div>
  );
}