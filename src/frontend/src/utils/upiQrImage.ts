// UPI QR code image path
export const UPI_QR_IMAGE_PATH = '/assets/generated/upi-qr.dim_800x800.jpg';

// Cache-busting version - increment this when the QR image is updated
export const UPI_QR_VERSION = '2';

// Helper function to get cache-busted QR URL
export function getUpiQrUrl(): string {
  return `${UPI_QR_IMAGE_PATH}?v=${UPI_QR_VERSION}`;
}
