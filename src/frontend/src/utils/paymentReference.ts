/**
 * Generates a short, human-readable payment reference code
 * Uses browser-safe randomness for unique transaction tracking
 */
export function generatePaymentReference(): string {
  // Use crypto.getRandomValues for secure randomness
  const array = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to uppercase alphanumeric (base36 without 0, O, I, L for clarity)
  const chars = '123456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let reference = 'WNU';
  
  for (let i = 0; i < array.length; i++) {
    reference += chars[array[i] % chars.length];
  }

  return reference;
}
