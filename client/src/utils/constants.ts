export const API_ENDPOINTS = {
  PAYMENTS: {
    INITIATE: '/api/payments/initiate',
    STATUS: '/api/payments/status',
    HISTORY: '/api/payments/history',
    B2C: '/api/payments/b2c',
    B2B: '/api/payments/b2b',
    BALANCE: '/api/payments/balance',
    QR_CODE: '/api/payments/qr-code',
    REVERSAL: '/api/payments/transaction-reversal',
  }
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  TIMEOUT: 'TIMEOUT',
  CANCELLED: 'CANCELLED',
} as const;

export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 1,
  MAX_AMOUNT: 70000,
  MAX_ACCOUNT_REFERENCE_LENGTH: 20,
  MIN_ACCOUNT_REFERENCE_LENGTH: 3,
} as const;

export const REFRESH_INTERVALS = {
  PAYMENT_STATUS: 5000, // 5 seconds
  PAYMENT_HISTORY: 30000, // 30 seconds
} as const;

export const COMMAND_IDS = {
  B2C: {
    SALARY_PAYMENT: 'SalaryPayment',
    BUSINESS_PAYMENT: 'BusinessPayment',
    PROMOTION_PAYMENT: 'PromotionPayment',
  },
  B2B: {
    BUSINESS_PAY_BILL: 'BusinessPayBill',
    BUSINESS_BUY_GOODS: 'BusinessBuyGoods',
    DISBURSE_FUNDS: 'DisburseFundsToBusiness',
    BUSINESS_TRANSFER: 'BusinessToBusinessTransfer',
  },
} as const;