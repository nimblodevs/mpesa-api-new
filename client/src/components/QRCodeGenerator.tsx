import React, { useState } from 'react';
import { QrCode, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  onQRGenerated: (qrCode: any) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ onQRGenerated }) => {
  const [formData, setFormData] = useState({
    merchantName: '',
    refNo: '',
    amount: '',
    trxCode: 'BG',
    cpi: '',
    size: '300',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedQR, setGeneratedQR] = useState<any>(null);

  const trxCodeOptions = [
    { value: 'BG', label: 'Buy Goods' },
    { value: 'WA', label: 'Withdraw Cash' },
    { value: 'PB', label: 'Pay Bill' },
    { value: 'SM', label: 'Send Money' },
  ];

  const sizeOptions = [
    { value: '200', label: '200x200' },
    { value: '300', label: '300x300' },
    { value: '400', label: '400x400' },
    { value: '500', label: '500x500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.merchantName || !formData.refNo || !formData.trxCode) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.amount && parseFloat(formData.amount) < 1) {
      setError('Amount must be at least 1 KSH if specified');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        merchantName: formData.merchantName,
        refNo: formData.refNo,
        trxCode: formData.trxCode,
        size: formData.size,
      };

      if (formData.amount) {
        requestData.amount = parseFloat(formData.amount);
      }

      if (formData.cpi) {
        requestData.cpi = formData.cpi;
      }

      const response = await fetch('http://localhost:3001/api/payments/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('QR Code generated successfully!');
        setGeneratedQR(data.data);
        onQRGenerated(data.data);
      } else {
        setError(data.message || 'QR Code generation failed');
      }
    } catch (error) {
      console.error('QR Code generation error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.href = generatedQR.qrCodeData;
    link.download = `qr-code-${generatedQR.refNo}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Generator</h2>
        <p className="text-gray-600">Generate M-Pesa QR codes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
            Merchant Name *
          </label>
          <input
            type="text"
            id="merchantName"
            value={formData.merchantName}
            onChange={(e) => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
            placeholder="My Business"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="refNo" className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number *
          </label>
          <input
            type="text"
            id="refNo"
            value={formData.refNo}
            onChange={(e) => setFormData(prev => ({ ...prev, refNo: e.target.value }))}
            placeholder="REF001"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (KSH) - Optional
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Leave empty for variable amount"
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 font-medium">KSH</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="trxCode" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type *
          </label>
          <select
            id="trxCode"
            value={formData.trxCode}
            onChange={(e) => setFormData(prev => ({ ...prev, trxCode: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            required
          >
            {trxCodeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cpi" className="block text-sm font-medium text-gray-700 mb-2">
            CPI (Optional)
          </label>
          <input
            type="text"
            id="cpi"
            value={formData.cpi}
            onChange={(e) => setFormData(prev => ({ ...prev, cpi: e.target.value }))}
            placeholder="174379"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Size
          </label>
          <select
            id="size"
            value={formData.size}
            onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            {sizeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating QR Code...
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </>
          )}
        </button>
      </form>

      {generatedQR && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <img
              src={generatedQR.qrCodeData}
              alt="Generated QR Code"
              className="mx-auto mb-4 border border-gray-200 rounded-lg"
            />
            <button
              onClick={downloadQRCode}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;