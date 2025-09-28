import React, { useState, useEffect } from "react";
import {
  CircleCheck as CheckCircle,
  CircleX,
  Clock,
  RefreshCw,
  History,
} from "lucide-react";

interface Reversal {
  id: string;
  conversationId: string;
  originatorConversationId: string;
  transactionId: string;
  amount: number;
  receiverParty: string;
  remarks: string;
  occasion?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  checkoutRequestId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  resultDesc?: string;
  createdAt: string;
  reversal?: Reversal | null;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://7qvlz9-3000.csb.app/api/payments/history"
      );
      const data = await response.json();

      if (data.success) {
        setPayments(data.data ?? []);
      } else {
        setError(data.message || "Failed to fetch payment history");
      }
    } catch (e) {
      console.error("Fetch payments error:", e);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "FAILED":
        return <CircleX className="w-5 h-5 text-red-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 bg-green-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <CircleX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPayments}
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
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-8 hover:shadow-3xl transition-all duration-300">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-lg">
            <History className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Payment History</h2>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </header>

      {payments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No Payments Yet
          </h3>
          <p className="text-gray-600 text-lg">Your payment history will appear here</p>
        </div>
      ) : (
        <section className="space-y-6">
          {payments.map((payment) => (
            <article
              key={payment.id}
              className="border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">
                      {formatAmount(payment.amount)}
                    </h4>
                    <p className="text-gray-600 font-medium">
                      {payment.accountReference}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-2 font-medium">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Phone Number</span>
                  <p className="font-semibold text-gray-900 mt-1">{payment.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Description</span>
                  <p className="font-semibold text-gray-900 mt-1">{payment.transactionDesc}</p>
                </div>
                {payment.mpesaReceiptNumber && (
                  <div>
                    <span className="text-gray-600 font-medium">M-Pesa Receipt</span>
                    <p className="font-mono text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 mt-1">
                      {payment.mpesaReceiptNumber}
                    </p>
                  </div>
                )}
              </div>

              {payment.resultDesc && (
                <p className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700 italic font-medium">
                  {payment.resultDesc}
                </p>
              )}

              {payment.reversal && (
                <section className="mt-6 p-4 border-2 border-amber-300 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 shadow-sm">
                  <h5 className="font-bold mb-3 text-amber-800">Reversal Details</h5>
                  <p>
                    <strong>Amount:</strong>{" "}
                    {formatAmount(payment.reversal.amount)}
                  </p>
                  <p>
                    <strong>Receiver:</strong> {payment.reversal.receiverParty}
                  </p>
                  <p>
                    <strong>Status:</strong> {payment.reversal.status}
                  </p>
                  <p>
                    <strong>Remarks:</strong> {payment.reversal.remarks}
                  </p>
                  <p className="text-sm text-amber-700 mt-3 font-medium">
                    Requested on {formatDate(payment.reversal.createdAt)}
                  </p>
                </section>
              )}
            </article>
          ))}
        </section>
      )}
      </div>
    </div>
  );
};

export default PaymentHistory;
