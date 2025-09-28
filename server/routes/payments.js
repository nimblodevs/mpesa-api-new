import express from "express";
import { paymentLimiter, statusLimiter } from "../middleware/rateLimiter.js";
import { 
  validatePaymentInitiation, 
  validateB2CPayment, 
  validateCheckoutRequestId 
} from "../middleware/validation.js";
import {
  initiatePayment,
  checkPaymentStatus,
  mpesaCallback,
  getPaymentsWithReversals,
  b2cPayment,
  b2bPayment,
  checkAccountBalance,
  checkTransactionStatus,
  generateQRCode,
  mpesaResult,
  mpesaTimeout,
  getB2CTransactions,
  getB2BTransactions,
  getQRCodes,
  reverseTransaction,
  getReversalHistory,
  retryFailedReversal,
  checkReversalStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

// C2B (Customer to Business) - STK Push
router.post("/initiate", paymentLimiter, validatePaymentInitiation, initiatePayment);
router.get("/status/:checkoutRequestId", statusLimiter, validateCheckoutRequestId, checkPaymentStatus);
router.get("/history", getPaymentsWithReversals);

// B2C (Business to Customer)
router.post("/b2c", paymentLimiter, validateB2CPayment, b2cPayment);
router.get("/b2c/history", getB2CTransactions);

// B2B (Business to Business)
router.post("/b2b", b2bPayment);
router.get("/b2b/history", getB2BTransactions);

// Account Balance
router.post("/balance", checkAccountBalance);

// Transaction Status
router.post("/transaction-status", checkTransactionStatus);
router.post("/transaction-reversal", reverseTransaction);
router.get("/reversals", getReversalHistory);
router.post("/reversals/:reversalId/retry", retryFailedReversal);
router.get("/reversals/:reversalId/status", checkReversalStatus);

// QR Code
router.post("/qr-code", generateQRCode);
router.get("/qr-codes", getQRCodes);

// M-Pesa Callbacks
router.post("/mpesa/callback", mpesaCallback);
router.post("/mpesa/result", mpesaResult);
router.post("/mpesa/timeout", mpesaTimeout);

export default router;
