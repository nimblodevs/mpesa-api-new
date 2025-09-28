import React, { useState } from 'react';
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface AccountBalanceFormProps {
  onBalanceChecked: (conversationId: string) => void;
}

const AccountBalanceForm: React.FC<AccountBalanceFormProps> = ({ onBalanceChecked }) => {
  const [formData, setFormData] = useState({
    partyA: '',
    identifierType: '4',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const identifierOptions = [
    { value: '1', label: 'MSISDN (Phone Number)' },
    { value: '2', label: 'Till Number' },
    { value: '4', label: 'Organization Short Code' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.partyA || !formData.remarks) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/payments/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partyA: formData.partyA,
          identifierType: formData.identifierType,
          remarks: formData.remarks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Account balance query initiated successfully!');
        onBalanceChecked(data.data.conversationId);
        
        setFormData({
          partyA: '',
          identifierType: '4',
          remarks: '',
        });
      } else {
        setError(data.message || 'Account balance query failed');
      }
    } catch (error) {
      console.error('Account balance error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Wallet className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Balance</h2>
        <p className="text-gray-600">Check account balance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="partyA" className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            id="partyA"
            value={formData.partyA}
            onChange={(e) => setFormData(prev => ({ ...prev, partyA: e.target.value }))}
            placeholder="600000 or 254712345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="identifierType" className="block text-sm font-medium text-gray-700 mb-2">
            Identifier Type *
          </label>
          <select
            id="identifierType"
            value={formData.identifierType}
            onChange={(e) => setFormData(prev => ({ ...prev, identifierType: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
            required
          >
            {identifierOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
            Remarks *
          </label>
          <input
            type="text"
            id="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Balance inquiry"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking Balance...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Check Balance
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AccountBalanceForm;