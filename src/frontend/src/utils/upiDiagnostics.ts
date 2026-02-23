/**
 * Generates a user-friendly, copyable diagnostic text for UPI payment issues
 * Excludes sensitive data (phone, email, UTR)
 */

export interface UpiDiagnosticData {
  paymentReference?: string;
  amount: string;
  outcome: 'launch-failed' | 'returned-quickly' | 'unknown';
  upiIntent: string;
}

export function generateDiagnosticText(data: UpiDiagnosticData): string {
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });

  const outcomeLabel = 
    data.outcome === 'launch-failed' 
      ? 'Deep-link did not launch UPI app'
      : data.outcome === 'returned-quickly'
      ? 'Returned quickly from UPI app (possible cancellation)'
      : 'Unknown outcome';

  const lines = [
    '=== UPI Payment Diagnostic ===',
    `Status: ${outcomeLabel}`,
    `Amount: ₹${data.amount}`,
  ];

  if (data.paymentReference) {
    lines.push(`Payment Reference: ${data.paymentReference}`);
  }

  lines.push(`Timestamp (IST): ${timestamp}`);
  lines.push('');
  lines.push('Generated UPI Intent URI:');
  lines.push(data.upiIntent);
  lines.push('');
  lines.push('Troubleshooting Steps:');
  lines.push('1. Try scanning the QR code with your UPI app instead');
  lines.push('2. Manually enter the UPI ID in your UPI app');
  lines.push('3. Ensure your UPI app is installed and up to date');
  lines.push('4. Try a different UPI app (Google Pay, PhonePe, Paytm, etc.)');
  lines.push('5. Check if your browser allows opening external apps');
  lines.push('');
  lines.push('Note: This diagnostic does not contain sensitive information.');
  lines.push('UTR, phone number, and email are explicitly excluded.');

  return lines.join('\n');
}
