import React, { useState } from "react";
import { RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock, Circle as XCircle } from "lucide-react";

interface TransactionReversalProps {
  onSuccess?: () => void;
}

interface ReversalStatus {
  id: string;
  status: string;
  transactionId: string;
  amount: number;
  receiverParty: string;
  remarks: string;
  retryCount: number;
  maxRetries: number;
  resultDesc?: string;
  failureReason?: string;
  createdAt: string;
  callbackReceivedAt?: string;
}

const TransactionReversal: React.FC<TransactionReversalProps> = ({
  onSuccess,
}) => {
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [receiverParty, setReceiverParty] = useState("174379");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reversalStatus, setReversalStatus] = useState<ReversalStatus | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "PROCESSING":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case "EXPIRED":
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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
      case "PROCESSING":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "EXPIRED":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleReverse = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setReversalStatus(null);

    // Validate inputs
    if (!transactionId.trim()) {
      setError("Transaction ID is required.");
      setLoading(false);
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }
    if (!receiverParty.trim()) {
      setError("Receiver party is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://7qvlz9-3000.csb.app/api/payments/transaction-reversal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
            amount: Number(amount),
            receiverParty,
            remarks: "Reversal requested by user",
            occasion: "User initiated reversal",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Reversal request initiated successfully. Tracking status...");
        setReversalStatus(data.data);
        setShowStatus(true);
        setTransactionId("");
        setAmount("");
        setReceiverParty("174379");
        if (onSuccess) onSuccess();
      } else {
        setError(data.message || "Failed to reverse transaction");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkReversalStatus = async (reversalId: string) => {
    try {
      const response = await fetch(
        `https://7qvlz9-3000.csb.app/api/payments/reversals/${reversalId}/status`
      );
      const data = await response.json();
      
      if (data.success) {
        setReversalStatus(data.data);
      }
    } catch (error) {
      console.error("Error checking reversal status:", error);
    }
  };

  const retryReversal = async (reversalId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://7qvlz9-3000.csb.app/api/payments/reversals/${reversalId}/retry`,
        { method: "POST" }
      );
      const data = await response.json();
      
      if (data.success) {
        setReversalStatus(data.data);
        setSuccess("Reversal retry initiated successfully");
        setError("");
      } else {
        setError(data.message || "Retry failed");
      }
    } catch (error) {
      setError("Network error during retry");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Reverse Transaction</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter M-Pesa Transaction ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (KES) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter Amount to Reverse"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receiver Party *
            </label>
            <input
              type="text"
              value={receiverParty}
              onChange={(e) => setReceiverParty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter Receiver Party (e.g., 174379)"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mt-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 mt-4">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <button
          onClick={handleReverse}
          disabled={loading}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing Reversal...
            </>
          ) : (
            "Request Reversal"
          )}
        </button>
      </div>

      {/* Reversal Status Tracking */}
      {showStatus && reversalStatus && (
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Reversal Status</h4>
            <button
              onClick={() => checkReversalStatus(reversalStatus.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Refresh Status
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(reversalStatus.status)}
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reversalStatus.status)}`}>
                  {reversalStatus.status}
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  Initiated: {formatDate(reversalStatus.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Transaction ID</span>
                <p className="font-mono text-xs bg-gray-50 p-2 rounded">{reversalStatus.transactionId}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount</span>
                <p className="font-semibold">KES {reversalStatus.amount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Retry Count</span>
                <p className="font-medium">{reversalStatus.retryCount} / {reversalStatus.maxRetries}</p>
              </div>
              <div>
                <span className="text-gray-500">Receiver</span>
                <p className="font-medium">{reversalStatus.receiverParty}</p>
              </div>
            </div>

            {reversalStatus.resultDesc && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 text-sm font-medium">Result:</span>
                <p className="text-sm text-gray-700 mt-1">{reversalStatus.resultDesc}</p>
              </div>
            )}

            {reversalStatus.failureReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 text-sm font-medium">Failure Reason:</span>
                <p className="text-sm text-red-600 mt-1">{reversalStatus.failureReason}</p>
              </div>
            )}

            {reversalStatus.callbackReceivedAt && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Callback received:</span> {formatDate(reversalStatus.callbackReceivedAt)}
              </div>
            )}

            {/* Retry button for failed reversals */}
            {(reversalStatus.status === "FAILED" || reversalStatus.status === "EXPIRED") && 
             reversalStatus.retryCount < reversalStatus.maxRetries && (
              <button
                onClick={() => retryReversal(reversalStatus.id)}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retry Reversal
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReversal;
