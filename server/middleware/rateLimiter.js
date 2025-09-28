import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for payment initiation
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 payment requests per minute
  message: {
    success: false,
    message: 'Too many payment requests, please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for status checks
export const statusLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Allow more frequent status checks
  message: {
    success: false,
    message: 'Too many status check requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});