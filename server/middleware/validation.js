import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const validatePaymentInitiation = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(254|0)[7][0-9]{8}$/)
    .withMessage('Invalid Kenyan phone number format'),
  body('amount')
    .isFloat({ min: 1, max: 70000 })
    .withMessage('Amount must be between 1 and 70,000 KSH'),
  body('accountReference')
    .isLength({ min: 3, max: 20 })
    .withMessage('Account reference must be between 3 and 20 characters'),
  body('transactionDesc')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Transaction description cannot exceed 100 characters'),
  handleValidationErrors,
];

export const validateB2CPayment = [
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(254|0)[7][0-9]{8}$/)
    .withMessage('Invalid Kenyan phone number format'),
  body('amount')
    .isFloat({ min: 1, max: 70000 })
    .withMessage('Amount must be between 1 and 70,000 KSH'),
  body('commandId')
    .isIn(['SalaryPayment', 'BusinessPayment', 'PromotionPayment'])
    .withMessage('Invalid command ID'),
  body('remarks')
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Remarks are required and cannot exceed 100 characters'),
  handleValidationErrors,
];

export const validateCheckoutRequestId = [
  param('checkoutRequestId')
    .notEmpty()
    .withMessage('Checkout request ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid checkout request ID format'),
  handleValidationErrors,
];