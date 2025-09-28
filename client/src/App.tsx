import React, { useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import { useToast } from "./hooks/useToast";
import PaymentForm from "./components/PaymentForm";
import PaymentStatus from "./components/PaymentStatus";
import PaymentHistory from "./components/PaymentHistory";
import B2CPaymentForm from "./components/B2CPaymentForm";
import B2BPaymentForm from "./components/B2BPaymentForm";
import AccountBalanceForm from "./components/AccountBalanceForm";
import QRCodeGenerator from "./components/QRCodeGenerator";
import TransactionReversal from "./components/TransactionReversal";
import {
  CreditCard,
  History,
  Smartphone,
  Send,
  Building2,
  Wallet,
  QrCode,
  RefreshCw,
  Sparkles,
} from "lucide-react";

function App() {
  const { toasts } = useToast();
  const [activeTab, setActiveTab] = useState<
    "c2b" | "b2c" | "b2b" | "balance" | "qr" | "history" | "reversal"
  >("c2b");
  const [currentCheckoutRequestId, setCurrentCheckoutRequestId] =
    useState<string>("");
  const [currentConversationId, setCurrentConversationId] =
    useState<string>("");

  const handlePaymentInitiated = (checkoutRequestId: string) => {
    setCurrentCheckoutRequestId(checkoutRequestId);
  };

  const handleB2CPaymentInitiated = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleB2BPaymentInitiated = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleBalanceChecked = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleQRGenerated = (qrCode: any) => {
    console.log("QR Code generated:", qrCode);
  };

  const handleCloseStatus = () => {
    setCurrentCheckoutRequestId("");
    setCurrentConversationId("");
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <ToastContainer toasts={toasts} />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  M-Pesa Payment Gateway
                </h1>
                <p className="text-gray-600 font-medium">
                  Secure payments with M-Pesa Daraja API
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-700">Sandbox Mode</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {/* Existing tabs */}
            <button
              onClick={() => setActiveTab("c2b")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "c2b"
                  ? "bg-emerald-100 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              C2B Payment
            </button>
            <button
              onClick={() => setActiveTab("b2c")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "b2c"
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Send className="w-4 h-4" />
              B2C Payment
            </button>
            <button
              onClick={() => setActiveTab("b2b")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "b2b"
                  ? "bg-purple-100 text-purple-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              B2B Payment
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "balance"
                  ? "bg-amber-100 text-amber-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Wallet className="w-4 h-4" />
              Balance
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "qr"
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-emerald-100 text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            {/* New Reversal tab */}
            <button
              onClick={() => setActiveTab("reversal")}
              className={`flex items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "reversal"
                  ? "bg-red-100 text-red-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Reversal
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentCheckoutRequestId || currentConversationId ? (
          <PaymentStatus
            checkoutRequestId={
              currentCheckoutRequestId || currentConversationId
            }
            onClose={handleCloseStatus}
          />
        ) : activeTab === "c2b" ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                C2B Payment (STK Push)
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Customer to Business payment using STK Push. Customer pays from
                their M-Pesa account.
              </p>
            </div>
            <PaymentForm onPaymentInitiated={handlePaymentInitiated} />
          </div>
        ) : activeTab === "b2c" ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                B2C Payment
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Business to Customer payment. Send money from your business
                account to customer's M-Pesa.
              </p>
            </div>
            <B2CPaymentForm onPaymentInitiated={handleB2CPaymentInitiated} />
          </div>
        ) : activeTab === "b2b" ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                B2B Payment
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Business to Business payment. Transfer funds between business
                accounts.
              </p>
            </div>
            <B2BPaymentForm onPaymentInitiated={handleB2BPaymentInitiated} />
          </div>
        ) : activeTab === "balance" ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                Account Balance
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Check the account balance for your M-Pesa business account.
              </p>
            </div>
            <AccountBalanceForm onBalanceChecked={handleBalanceChecked} />
          </div>
        ) : activeTab === "qr" ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                QR Code Generator
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Generate M-Pesa QR codes for easy payments. Customers can scan
                to pay.
              </p>
            </div>
            <QRCodeGenerator onQRGenerated={handleQRGenerated} />
          </div>
        ) : activeTab === "reversal" ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">
                Transaction Reversal
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Request a reversal for a previously made transaction.
              </p>
            </div>
            <TransactionReversal />
          </div>
        ) : (
          <PaymentHistory />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Smartphone className="w-6 h-6 text-emerald-600" />
              <span className="text-gray-700 font-semibold text-lg">
                Powered by M-Pesa Daraja API
              </span>
            </div>
            <p className="text-gray-500 max-w-md mx-auto">
              This is a demonstration application. Use test credentials for
              sandbox mode.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}

export default App;
