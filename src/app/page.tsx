import CommissionCalculator from '@/components/CommissionCalculator';
import { Shield, Users, TrendingUp, FileText, Star, CheckCircle, Tag, Wallet, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="https://kpcvault.org" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80 transition-opacity">
                <Image src="/kpc-vault-logo.svg" alt="KPC Vault Logo" width={120} height={36} className="mr-4" />
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-600 font-medium">Premier Consignment Services</p>
                </div>
              </a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#calculator" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Calculator</a>
              <a href="/consign" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Consign Items</a>
              <a href="/portal" className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">Client Portal</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="text-yellow-400 mr-3" size={32} />
                <span className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">Trusted Since 2024</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Premium Consignment
                <span className="text-yellow-400"> Made Simple</span>
              </h2>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Professional handling of your valuable items with transparent pricing, digital contracts, and real-time tracking.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a href="/consign" className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg">
                  Start Consigning Today
                </a>
                <a href="/portal" className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:text-blue-900 transition-all">
                  Client Portal
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="bg-blue-500/20 rounded-full p-3 border border-blue-400/30">
                        <Tag className="text-yellow-400" size={24} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">2.7K+</div>
                    <div className="text-sm text-blue-200">Items Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="bg-blue-500/20 rounded-full p-3 border border-blue-400/30">
                        <Shield className="text-yellow-400" size={24} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">Zero</div>
                    <div className="text-sm text-blue-200">Upfront Fees</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="bg-blue-500/20 rounded-full p-3 border border-blue-400/30">
                        <Wallet className="text-yellow-400" size={24} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">Transparent</div>
                    <div className="text-sm text-blue-200">Payouts</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="bg-blue-500/20 rounded-full p-3 border border-blue-400/30">
                        <Calendar className="text-yellow-400" size={24} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">30</div>
                    <div className="text-sm text-blue-200">Day Avg. Sale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose KPC Vault?</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Professional consignment services with transparent, competitive rates and white-glove handling of your valuable items</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="text-blue-900" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Dynamic Pricing</h4>
              <p className="text-gray-600 leading-relaxed">
                Competitive commission rates based on item value: 25% for high-value items, up to 40% for smaller pieces
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="text-white" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Digital Contracts</h4>
              <p className="text-gray-600 leading-relaxed">
                Automated contract generation with electronic signatures and secure PDF delivery
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="text-yellow-400" size={32} />
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Client Portal</h4>
              <p className="text-gray-600 leading-relaxed">
                Real-time tracking of your items, sales status, and comprehensive payment history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Calculator Section */}
      <section id="calculator" className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-400 rounded-full p-3">
                <TrendingUp className="text-blue-900" size={32} />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Commission Calculator</h3>
            <p className="text-lg text-gray-600">
              See exactly what you'll earn with our transparent pricing structure
            </p>
          </div>
          
          <CommissionCalculator />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Star className="text-yellow-400 mr-2" size={32} />
            <Star className="text-yellow-400 mr-2" size={32} />
            <Star className="text-yellow-400 mr-2" size={32} />
            <Star className="text-yellow-400 mr-2" size={32} />
            <Star className="text-yellow-400" size={32} />
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Consigning?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of satisfied clients who trust KPC Vault with their valuable items
          </p>
          <div className="flex justify-center items-center mb-8">
            <CheckCircle className="text-yellow-400 mr-2" size={20} />
            <span className="text-sm">No upfront fees • Professional photography • Expert authentication</span>
          </div>
          <a href="/consign" className="bg-yellow-400 text-blue-900 px-12 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-xl inline-block">
            Begin Consignment Process
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <a href="https://kpcvault.org" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                <Image src="/kpc-vault-logo.svg" alt="KPC Vault Logo" width={120} height={36} className="mb-4 brightness-0 invert" />
              </a>
              <p className="text-gray-400">Professional consignment services for luxury and collectible items.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/consign" className="hover:text-yellow-400 transition-colors">Consign Items</a></li>
                <li><a href="/portal" className="hover:text-yellow-400 transition-colors">Client Portal</a></li>
                <li><a href="#calculator" className="hover:text-yellow-400 transition-colors">Calculator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-yellow-400">Contact</h4>
              <p className="text-gray-400 mb-2">Email: hello@kpcvault.com</p>
              <p className="text-gray-400">Professional consignment services</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <span className="text-gray-400">© 2024 KPC Vault. All rights reserved.</span>
            <div className="text-sm text-gray-500 mt-4 md:mt-0">
              Built with Next.js • Powered by Airtable
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}