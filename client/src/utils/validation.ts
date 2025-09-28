export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phoneNumber) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }

  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    // Valid international format
  } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Valid local format
  } else if (cleaned.length === 9 && cleaned.startsWith('7')) {
    // Valid without leading zero
  } else {
    errors.push('Please enter a valid Kenyan phone number (07XXXXXXXX or 254XXXXXXXXX)');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateAmount = (amount: string | number): ValidationResult => {
  const errors: string[] = [];
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (!amount || amount === '') {
    errors.push('Amount is required');
  } else if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
  } else if (numAmount < 1) {
    errors.push('Amount must be at least 1 KSH');
  } else if (numAmount > 70000) {
    errors.push('Amount cannot exceed 70,000 KSH per transaction');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateAccountReference = (reference: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!reference) {
    errors.push('Account reference is required');
  } else if (reference.length < 3) {
    errors.push('Account reference must be at least 3 characters');
  } else if (reference.length > 20) {
    errors.push('Account reference cannot exceed 20 characters');
  }

  return { isValid: errors.length === 0, errors };
};