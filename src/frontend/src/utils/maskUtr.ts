/**
 * Masks a UPI transaction reference (UTR) for public display
 * Shows only first 3 and last 3 characters
 * @param utr The full UTR string
 * @returns Masked UTR string
 */
export function maskUtr(utr: string): string {
  if (!utr || utr.length <= 6) {
    return '***';
  }
  
  const prefix = utr.substring(0, 3);
  const suffix = utr.substring(utr.length - 3);
  const maskedMiddle = '*'.repeat(Math.min(utr.length - 6, 6));
  
  return `${prefix}${maskedMiddle}${suffix}`;
}
