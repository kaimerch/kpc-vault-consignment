import IntakeForm from '@/components/IntakeForm';

export default function ConsignPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Consign Your Items</h1>
          <p className="text-lg text-black">
            Start the consignment process with our simple 3-step application
          </p>
        </div>
        
        <IntakeForm />
      </div>
    </main>
  );
}