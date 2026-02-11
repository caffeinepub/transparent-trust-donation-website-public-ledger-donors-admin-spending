/**
 * Utility functions to normalize and sanitize donation form inputs
 * to prevent mobile formatting (spaces, hyphens, commas) from breaking validation
 */

/**
 * Normalizes an Indian phone number to the format +91XXXXXXXXXX
 * Removes spaces, hyphens, and other separators
 * @param phone - Phone number string (may contain spaces, hyphens, etc.)
 * @returns Normalized phone number in format +91XXXXXXXXXX
 */
export function normalizeIndianPhone(phone: string): string {
  // Remove all whitespace and common separators
  let normalized = phone.replace(/[\s\-()]/g, '');
  
  // If it starts with 91 without +, add the +
  if (normalized.startsWith('91') && !normalized.startsWith('+91')) {
    normalized = '+' + normalized;
  }
  
  // If it starts with just the 10 digits, add +91
  if (/^[6-9]\d{9}$/.test(normalized)) {
    normalized = '+91' + normalized;
  }
  
  return normalized;
}

/**
 * Normalizes a UTR (UPI Transaction Reference) by removing all whitespace
 * @param utr - UTR string (may contain spaces)
 * @returns Normalized UTR with all spaces removed
 */
export function normalizeUtr(utr: string): string {
  return utr.replace(/\s/g, '');
}

/**
 * Sanitizes an amount string by removing commas and extra whitespace
 * @param amount - Amount string (may contain commas, spaces)
 * @returns Sanitized amount string
 */
export function sanitizeAmount(amount: string): string {
  return amount.replace(/[,\s]/g, '');
}

/**
 * Validates a normalized Indian phone number
 * @param phone - Phone number in format +91XXXXXXXXXX
 * @returns true if valid, false otherwise
 */
export function isValidIndianPhone(phone: string): boolean {
  // Must be exactly 13 characters: +91 followed by 10 digits
  if (phone.length !== 13) return false;
  if (!phone.startsWith('+91')) return false;
  
  const digits = phone.substring(3);
  // First digit must be 6-9, rest must be 0-9
  if (digits[0] < '6' || digits[0] > '9') return false;
  return /^\d{10}$/.test(digits);
}

/**
 * Validates a normalized UTR
 * @param utr - UTR string (should be normalized first)
 * @returns true if valid (12 characters), false otherwise
 */
export function isValidUtr(utr: string): boolean {
  return utr.length === 12;
}
