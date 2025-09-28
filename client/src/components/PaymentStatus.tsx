import React, { useState, useEffect } from "react";
import {
  CircleCheck as CheckCircle,
  Circle as XCircle,
  Clock,
  Loader as Loader2,
  RefreshCw,
} from "lucide-react";

interface Payment {
  id: string;
  checkoutRequestId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  resultDesc?: string;
  createdAt: string;
}

interface PaymentStatusProps {
  checkoutRequestId: string;
  onClose: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  checkoutRequestId,
  onClose,
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000); // Start with 5 seconds

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "PENDING":
        return <Clock className="w-12 h-12 text-yellow-500" />;
      default:
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-50 border-green-200";
      case "FAILED":
        return "text-red-600 bg-red-50 border-red-200";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const checkPaymentStatus = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://7qvlz9-3000.csb.app/api/payments/status/${checkoutRequestId}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setPayment(data.data);
        setRateLimited(data.data.rateLimited || false);

        // If rate limited, increase refresh interval to reduce API calls
        if (data.data.rateLimited) {
          setRefreshInterval(30000); // 30 seconds when rate limited
        } else if (data.data.status === "PENDING") {
          setRefreshInterval(10000); // 10 seconds for pending payments
        }
      } else {
        setError(data.message || "Failed to fetch payment status");
      }
    } catch (error) {
      console.error("Status check error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();

    // Auto-refresh for pending payments with dynamic interval
    const interval = setInterval(() => {
      if (payment?.status === "PENDING") {
        checkPaymentStatus();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [checkoutRequestId, payment?.status, refreshInterval]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !payment) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Checking Payment Status
          </h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={checkPaymentStatus}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8 hover:shadow-3xl transition-all duration-300">
      <div className="text-center mb-6">
        {getStatusIcon(payment?.status || "")}
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mt-6 mb-4">
          Payment {payment?.status || "Processing"}
        </h3>

        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 shadow-sm ${getStatusColor(
            payment?.status || ""
          )}`}
        >
          {payment?.status || "PROCESSING"}
        </div>
      </div>

      {payment && (
        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Amount</span>
                <p className="font-bold text-xl text-emerald-600 mt-1">
                  {formatAmount(payment.amount)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Phone</span>
                <p className="font-semibold text-gray-900 mt-1">{payment.phoneNumber}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Reference</span>
                <p className="font-semibold text-gray-900 mt-1">{payment.accountReference}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Date</span>
                <p className="font-semibold text-gray-900 mt-1">{formatDate(payment.createdAt)}</p>
              </div>
            </div>
          </div>

          {payment.mpesaReceiptNumber && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 shadow-sm">
              <span className="text-emerald-800 text-sm font-bold">
                M-Pesa Receipt
              </span>
              <p className="text-emerald-900 font-mono text-sm mt-2 bg-white px-3 py-2 rounded-lg border">
                {payment.mpesaReceiptNumber}
              </p>
            </div>
          )}

          {payment.resultDesc && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <span className="text-blue-800 text-sm font-semibold block mb-2">
                Transaction Details
              </span>
              <p className="text-blue-700 text-sm">
                {payment.resultDesc}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        {payment?.status === "PENDING" && (
          <button
            onClick={checkPaymentStatus}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            <span>Refresh</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
        >
          Close
        </button>
      </div>

      {payment?.status === "PENDING" && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2 rounded-full inline-block">
            Status updates automatically every 5 seconds
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default PaymentStatus;
