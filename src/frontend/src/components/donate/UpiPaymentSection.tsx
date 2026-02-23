import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Info, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { UPI_CONFIG } from '@/config/upi';

interface UpiPaymentSectionProps {
  amountInPaise: bigint;
  paymentReference?: string;
}

export default function UpiPaymentSection({ amountInPaise, paymentReference }: UpiPaymentSectionProps) {
  const [copied, setCopied] = useState<'upi1' | 'upi2' | 'amount' | 'reference' | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  
  const amountInRupees = (Number(amountInPaise) / 100).toFixed(2);

  const handleCopy = async (text: string, type: 'upi1' | 'upi2' | 'amount' | 'reference') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      const label = type === 'upi1' || type === 'upi2' ? 'UPI ID' : type === 'amount' ? 'Amount' : 'Reference';
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Reset state when amount changes
  useEffect(() => {
    setShowQrCode(false);
  }, [amountInPaise]);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Step 1: Pay via UPI
        </CardTitle>
        <CardDescription>
          Copy the UPI ID and amount below, then pay using your UPI app. After payment, save a screenshot of the successful payment confirmation to upload in Step 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="space-y-4">
          {paymentReference && (
            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentReference}
                  readOnly
                  className="font-mono font-semibold text-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(paymentReference, 'reference')}
                >
                  <Copy className={`h-4 w-4 ${copied === 'reference' ? 'text-green-600' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                This is a locally generated reference code for your payment note
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Accepted UPI IDs (Choose One)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={UPI_CONFIG.payeeVPA}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(UPI_CONFIG.payeeVPA, 'upi1')}
                >
                  <Copy className={`h-4 w-4 ${copied === 'upi1' ? 'text-green-600' : ''}`} />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={UPI_CONFIG.secondaryVPA}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(UPI_CONFIG.secondaryVPA, 'upi2')}
                >
                  <Copy className={`h-4 w-4 ${copied === 'upi2' ? 'text-green-600' : ''}`} />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Payee: {UPI_CONFIG.payeeName}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Amount to Pay</Label>
            <div className="flex gap-2">
              <Input
                value={`₹${amountInRupees}`}
                readOnly
                className="font-bold text-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopy(amountInRupees, 'amount')}
              >
                <Copy className={`h-4 w-4 ${copied === 'amount' ? 'text-green-600' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowQrCode(!showQrCode)}
            className="w-full"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {showQrCode ? 'Hide' : 'Show'} QR Code
          </Button>

          {showQrCode && (
            <div className="border rounded-lg p-4 bg-background">
              <img
                src="/assets/generated/upi-qr.dim_800x800.jpg"
                alt="UPI QR Code"
                className="w-full max-w-xs mx-auto"
              />
              <p className="text-xs text-center text-muted-foreground mt-2">
                Scan with any UPI app to pay
              </p>
            </div>
          )}
        </div>

        {/* Manual Payment Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <p className="font-semibold mb-2">Manual Payment Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
              <li>Choose "Send Money" or "Pay to UPI ID"</li>
              <li>Enter one of the UPI IDs shown above</li>
              <li>Enter the exact amount: ₹{amountInRupees}</li>
              <li>Complete the payment</li>
              <li>Take a screenshot of the successful payment confirmation</li>
              <li>Upload the screenshot in Step 2 below</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
