'use client';

export default function ContractSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Signed Successfully!</h1>
        
        <div className="text-gray-600 mb-6 space-y-3">
          <p>Thank you for signing your consignment agreement with KPC Vault.</p>
          <p>📧 A copy of your signed contract has been sent to your email address.</p>
          <p>📱 We'll keep you updated on the status of your items via email and phone.</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• We'll photograph and research your items</li>
            <li>• Items will be listed on appropriate platforms</li>
            <li>• You'll receive updates on pricing and sales</li>
            <li>• Payment within 30 days after sale completion</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            <strong>Questions?</strong><br />
            Call us: <a href="tel:760-278-3132" className="text-blue-600">760-278-3132</a><br />
            Email: <a href="mailto:dana@kpcvault.org" className="text-blue-600">dana@kpcvault.org</a>
          </p>
          
          <a 
            href="/portal" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            View Your Items Portal
          </a>
        </div>
      </div>
    </div>
  );
}