import CommissionCalculator from '@/components/CommissionCalculator';
import { Package, Users, TrendingUp, FileText } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="text-blue-600 mr-3" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KPC Vault</h1>
                <p className="text-sm text-black">Consignment Management System</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#calculator" className="text-black hover:text-gray-900">Calculator</a>
              <a href="/consign" className="text-black hover:text-gray-900">Consign Items</a>
              <a href="/portal" className="text-black hover:text-gray-900">Client Portal</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Professional Consignment Made Simple
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Transparent pricing, seamless contracts, and real-time tracking
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/consign" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Consigning
            </a>
            <a href="/portal" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Portal
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose KPC Vault?</h3>
            <p className="text-lg text-black">Professional consignment services with transparent, competitive rates</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-blue-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-black">Dynamic Pricing</h4>
              <p className="text-black">
                Competitive commission rates based on item value: 25% for high-value items, up to 40% for smaller pieces
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-green-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-black">Digital Contracts</h4>
              <p className="text-black">
                Automated contract generation with electronic signatures and PDF delivery
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-black">Client Portal</h4>
              <p className="text-black">
                Real-time tracking of your items, sales status, and payment history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Calculator Section */}
      <section id="calculator" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Commission Calculator</h3>
            <p className="text-lg text-black">
              See exactly what you'll earn with our transparent pricing structure
            </p>
          </div>
          
          <CommissionCalculator />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Consigning?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of satisfied clients who trust KPC Vault with their valuable items
          </p>
          <a href="/consign" className="bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors inline-block">
            Begin Consignment Process
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Package className="text-gray-900 mr-2" size={24} />
              <span className="text-black">© 2024 KPC Vault. All rights reserved.</span>
            </div>
            <div className="text-sm text-black">
              Built with Next.js • Powered by Airtable
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}