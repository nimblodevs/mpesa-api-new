import React, { useState } from "react";
import { Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface B2CPaymentFormProps {
  onPaymentInitiated: (conversationId: string) => void;
}

const B2CPaymentForm: React.FC<B2CPaymentFormProps> = ({
  onPaymentInitiated,
}) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: "",
    commandId: "BusinessPayment",
    remarks: "",
    occasion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const commandOptions = [
    { value: "SalaryPayment", label: "Salary Payment" },
    { value: "BusinessPayment", label: "Business Payment" },
    { value: "PromotionPayment", label: "Promotion Payment" },
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.phoneNumber || !formData.amount || !formData.remarks) {
      setError("Please fill in all required fields");
      return;
    }

    const formattedPhone = formatPhoneNumber(formData.phoneNumber);
    if (formattedPhone.length !== 12) {
      setError("Please enter a valid Kenyan phone number");
      return;
    }

    if (parseFloat(formData.amount) < 1) {
      setError("Amount must be at least 1 KSH");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://7qvlz9-3000.csb.app/api/payments/b2c",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: formattedPhone,
            amount: parseFloat(formData.amount),
            commandId: formData.commandId,
            remarks: formData.remarks,
            occasion: formData.occasion,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("B2C payment initiated successfully!");
        onPaymentInitiated(data.data.conversationId);

        setFormData({
          phoneNumber: "",
          amount: "",
          commandId: "BusinessPayment",
          remarks: "",
          occasion: "",
        });
      } else {
        setError(data.message || "B2C payment initiation failed");
      }
    } catch (error) {
      console.error("B2C payment error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Send className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">B2C Payment</h2>
        <p className="text-gray-600">Send money to customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Customer Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
            }
            placeholder="0712345678 or 254712345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount (KSH) *
          </label>
          <div className="relative">
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
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 font-medium">KSH</span>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="commandId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Payment Type *
          </label>
          <select
            id="commandId"
            value={formData.commandId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, commandId: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            {commandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="remarks"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Remarks *
          </label>
          <input
            type="text"
            id="remarks"
            value={formData.remarks}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, remarks: e.target.value }))
            }
            placeholder="Payment for services"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label
            htmlFor="occasion"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Occasion (Optional)
          </label>
          <input
            type="text"
            id="occasion"
            value={formData.occasion}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, occasion: e.target.value }))
            }
            placeholder="Special occasion"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Initiating Payment...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Payment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default B2CPaymentForm;
