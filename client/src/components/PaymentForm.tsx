import React, { useState } from "react";
import { CreditCard, Smartphone, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Loader as Loader2 } from "lucide-react";

interface PaymentFormProps {
  onPaymentInitiated: (checkoutRequestId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentInitiated }) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: "",
    accountReference: "",
    transactionDesc: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.startsWith("254")) {
      return numbers;
    } else if (numbers.startsWith("0")) {
      return "254" + numbers.substring(1);
    } else if (numbers.length <= 9) {
      return "254" + numbers;
    }
    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  };

  const validateForm = () => {
    const { phoneNumber, amount, accountReference } = formData;

    if (!phoneNumber || !amount || !accountReference) {
      setError("Please fill in all required fields");
      return false;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (formattedPhone.length !== 12) {
      setError("Please enter a valid Kenyan phone number");
      return false;
    }

    if (parseFloat(amount) < 1) {
      setError("Amount must be at least 1 KSH");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);

      const response = await fetch(
        "https://7qvlz9-3000.csb.app/api/payments/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: formattedPhone,
            amount: parseFloat(formData.amount),
            accountReference: formData.accountReference,
            transactionDesc: formData.transactionDesc || "Payment",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Payment initiated! Check your phone for M-Pesa prompt.");
        onPaymentInitiated(data.data.checkoutRequestId);

        setFormData({
          phoneNumber: "",
          amount: "",
          accountReference: "",
          transactionDesc: "",
        });
      } else {
        setError(data.message || "Payment initiation failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8 hover:shadow-3xl transition-all duration-300">
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl mb-6 shadow-lg">
          <Smartphone className="w-10 h-10 text-emerald-600" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">₹</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
          M-Pesa Payment
        </h2>
        <p className="text-gray-600 text-lg">Pay securely with M-Pesa</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-semibold text-gray-800 mb-3"
          >
            Phone Number *
          </label>
          <div className="relative group">
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="0712345678 or 254712345678"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 group-hover:border-gray-300"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-lg">🇰🇪</span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-semibold text-gray-800 mb-3"
          >
            Amount (KSH) *
          </label>
          <div className="relative group">
            <input
              type="number"
              id="amount"
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="100"
              className="w-full px-4 py-4 pl-16 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 group-hover:border-gray-300"
              required
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-gray-600 font-semibold text-sm bg-gray-100 px-2 py-1 rounded-md">KSH</span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="accountReference"
            className="block text-sm font-semibold text-gray-800 mb-3"
          >
            Account Reference *
          </label>
          <div className="group">
          <input
            type="text"
            id="accountReference"
            value={formData.accountReference}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                accountReference: e.target.value,
              }))
            }
            placeholder="Invoice #12345"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 group-hover:border-gray-300"
            required
          />
          </div>
        </div>

        <div>
          <label
            htmlFor="transactionDesc"
            className="block text-sm font-semibold text-gray-800 mb-3"
          >
            Description (Optional)
          </label>
          <div className="group">
          <input
            type="text"
            id="transactionDesc"
            value={formData.transactionDesc}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                transactionDesc: e.target.value,
              }))
            }
            placeholder="Payment for services"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 group-hover:border-gray-300"
          />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl text-red-700 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-xl text-emerald-700 shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Initiating Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              <span>Pay with M-Pesa</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 font-medium">Powered by M-Pesa Daraja API</p>
      </div>
      </div>
    </div>
  );
};

export default PaymentForm;
