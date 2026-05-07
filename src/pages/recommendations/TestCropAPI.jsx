import React, { useState } from 'react';
import { getCropAdvisory } from '../../api/cropAdvisoryApi';

const TestCropAPI = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      console.log('🧪 Testing API with sample data...');
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('🌐 Base URL:', import.meta.env.VITE_API_BASE_URL);

      const result = await getCropAdvisory({
        crop: "cotton",
        issue: "White Fly",
        symptoms: "White insects on leaf undersides, yellowing leaves",
        fieldSize: 5,
        location: "Punjab, Pakistan",
        language: "en"
      });

      console.log('✅ Success:', result);
      setResponse(result);
    } catch (err) {
      console.error('❌ Error:', err);
      console.error('❌ Response:', err.response);
      setError({
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Crop Advisory API</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Environment Info:</h2>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
        <p><strong>Token Present:</strong> {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Token Value:</strong> {localStorage.getItem('token')?.substring(0, 50)}...</p>
      </div>

      <button
        onClick={testAPI}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Call'}
      </button>

      {loading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">Loading...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-bold text-red-800 mb-2">Error:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-bold text-green-800 mb-2">Success Response:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestCropAPI;
