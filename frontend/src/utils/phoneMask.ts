/**
 * Masks a phone number by showing only the first 5 characters followed by asterisks.
 * Used as a defensive fallback to ensure non-admin views never render an unmasked phone number.
 * 
 * @param phone - The phone number to mask
 * @returns Masked phone number (e.g., "98765******") or null if input is null/undefined
 */
export function maskPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  const length = phone.length;
  if (length <= 5) return phone;
  
  const visiblePart = phone.substring(0, 5);
  const maskedPart = '*'.repeat(Math.max(6, length - 5));
  
  return visiblePart + maskedPart;
}
