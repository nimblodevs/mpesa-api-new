import React, { useState } from 'react';
import { Building2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface B2BPaymentFormProps {
  onPaymentInitiated: (conversationId: string) => void;
}

const B2BPaymentForm: React.FC<B2BPaymentFormProps> = ({ onPaymentInitiated }) => {
  const [formData, setFormData] = useState({
    partyB: '',
    amount: '',
    commandId: 'BusinessPayBill',
    accountReference: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const commandOptions = [
    { value: 'BusinessPayBill', label: 'Business Pay Bill' },
    { value: 'BusinessBuyGoods', label: 'Business Buy Goods' },
    { value: 'DisburseFundsToBusiness', label: 'Disburse Funds to Business' },
    { value: 'BusinessToBusinessTransfer', label: 'Business to Business Transfer' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.partyB || !formData.amount || !formData.accountReference || !formData.remarks) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) < 1) {
      setError('Amount must be at least 1 KSH');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/payments/b2b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partyB: formData.partyB,
          amount: parseFloat(formData.amount),
          commandId: formData.commandId,
          accountReference: formData.accountReference,
          remarks: formData.remarks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('B2B payment initiated successfully!');
        onPaymentInitiated(data.data.conversationId);
        
        setFormData({
          partyB: '',
          amount: '',
          commandId: 'BusinessPayBill',
          accountReference: '',
          remarks: '',
        });
      } else {
        setError(data.message || 'B2B payment initiation failed');
      }
    } catch (error) {
      console.error('B2B payment error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Building2 className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">B2B Payment</h2>
        <p className="text-gray-600">Business to business payment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="partyB" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Business Code *
          </label>
          <input
            type="text"
            id="partyB"
            value={formData.partyB}
            onChange={(e) => setFormData(prev => ({ ...prev, partyB: e.target.value }))}
            placeholder="600000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (KSH) *
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="100"
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              required
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 font-medium">KSH</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="commandId" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type *
          </label>
          <select
            id="commandId"
            value={formData.commandId}
            onChange={(e) => setFormData(prev => ({ ...prev, commandId: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            required
          >
            {commandOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="accountReference" className="block text-sm font-medium text-gray-700 mb-2">
            Account Reference *
          </label>
          <input
            type="text"
            id="accountReference"
            value={formData.accountReference}
            onChange={(e) => setFormData(prev => ({ ...prev, accountReference: e.target.value }))}
            placeholder="Invoice #12345"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            required
          />
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
            placeholder="Payment for services"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initiating Payment...
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5" />
              Send B2B Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default B2BPaymentForm;