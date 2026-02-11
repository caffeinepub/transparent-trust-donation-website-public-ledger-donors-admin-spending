# Specification

## Summary
**Goal:** Update the Donate page to display the newly provided UPI QR code image while keeping the existing frontend path and references unchanged.

**Planned changes:**
- Replace the static asset at `frontend/public/assets/generated/upi-qr.dim_800x800.jpg` with the newly uploaded QR image.
- Ensure the QR continues to be loaded from `UPI_QR_IMAGE_PATH` (`/assets/generated/upi-qr.dim_800x800.jpg`) without changing any frontend code references.

**User-visible outcome:** On the Donate flow, the UPI payment section shows the updated QR code, and “Open QR Full Size” opens the same updated QR image successfully.
