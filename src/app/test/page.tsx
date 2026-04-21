import SimpleIntakeForm from '@/components/SimpleIntakeForm';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Airtable Submission Test
          </h1>
          <p className="text-lg text-gray-600">
            Direct submission bypassing all Vercel API issues
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <SimpleIntakeForm />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This test page uses direct Airtable API calls from the frontend.</p>
          <p>Check browser console for detailed logging.</p>
        </div>
      </div>
    </div>
  );
}