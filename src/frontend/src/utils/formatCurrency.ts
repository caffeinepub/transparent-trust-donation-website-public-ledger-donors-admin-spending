/**
 * Formats a bigint amount (in minor units, e.g., paise) as Indian Rupees (₹)
 * with Indian digit grouping (en-IN locale).
 * 
 * @param amount - Amount in minor units (e.g., 100 paise = ₹1.00)
 * @returns Formatted currency string with ₹ symbol
 */
export function formatINR(amount: bigint | undefined): string {
  if (amount === undefined) return '₹0.00';
  
  const numericAmount = Number(amount) / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
