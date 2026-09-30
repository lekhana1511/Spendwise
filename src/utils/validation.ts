// Validation utilities
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

export function isValidAmount(amount: any): { valid: boolean; message?: string } {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, message: 'Please enter a valid positive amount' };
  }
  if (num > 10000000) {
    return { valid: false, message: 'Amount exceeds maximum allowable limit' };
  }
  return { valid: true };
}
