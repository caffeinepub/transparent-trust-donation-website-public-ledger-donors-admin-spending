// UPI payment configuration
export const UPI_CONFIG = {
  // Trust UPI ID
  payeeVPA: 'anwarulhaq-wnu.org@fam',
  payeeName: 'Why Not Us Trust',
  merchantCode: 'WHYNOTUS',
};

/**
 * Generates a UPI payment intent URI for mobile reliability
 * Uses consistent encoding and stable parameter formatting
 * @param amountInPaise - Amount in paise (1 rupee = 100 paise)
 * @returns UPI intent URI string
 */
export function generateUpiIntent(amountInPaise: bigint): string {
  const amountInRupees = (Number(amountInPaise) / 100).toFixed(2);
  
  // Use standard UPI URI format with properly encoded parameters
  // Avoid special characters that can break mobile deep-link handling
  const params = new URLSearchParams({
    pa: UPI_CONFIG.payeeVPA,
    pn: UPI_CONFIG.payeeName,
    am: amountInRupees,
    cu: 'INR',
    tn: 'Donation to Why Not Us Trust',
  });

  // Return standard UPI intent format
  return `upi://pay?${params.toString()}`;
}
