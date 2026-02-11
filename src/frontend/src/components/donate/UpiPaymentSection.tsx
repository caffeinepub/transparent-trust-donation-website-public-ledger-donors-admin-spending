import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Smartphone, QrCode, Info, AlertCircle, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { UPI_CONFIG, generateUpiIntent } from '@/config/upi';
import { UPI_QR_IMAGE_PATH } from '@/utils/upiQrImage';

interface UpiPaymentSectionProps {
  amountInPaise: bigint;
}

export default function UpiPaymentSection({ amountInPaise }: UpiPaymentSectionProps) {
  const [copied, setCopied] = useState<'upi' | 'amount' | null>(null);
  const [qrError, setQrError] = useState(false);
  const [deepLinkFailed, setDeepLinkFailed] = useState(false);
  
  const amountInRupees = (Number(amountInPaise) / 100).toFixed(2);
  const upiIntent = generateUpiIntent(amountInPaise);

  const handleCopy = async (text: string, type: 'upi' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type === 'upi' ? 'UPI ID' : 'Amount'} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleUpiPayment = () => {
    setDeepLinkFailed(false);
    
    try {
      // Create a temporary anchor element for better mobile compatibility
      const anchor = document.createElement('a');
      anchor.href = upiIntent;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      
      // Attempt to trigger the UPI app
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Check if we're still on the page after a short delay
      // If the deep link worked, the browser should have switched to the UPI app
      setTimeout(() => {
        if (document.hasFocus()) {
          // Still on the page - deep link likely failed
          setDeepLinkFailed(true);
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to open UPI app:', error);
      setDeepLinkFailed(true);
      toast.error('Could not open UPI app. Please use the QR code or manual payment method.');
    }
  };

  const handleOpenQrFullSize = () => {
    window.open(UPI_QR_IMAGE_PATH, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Step 1: Pay via UPI
        </CardTitle>
        <CardDescription>
          Scan the QR code or use the UPI ID to pay the exact amount, then enter your 12-digit UTR below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Section */}
        <div className="bg-background rounded-lg p-6 border-2 border-primary/20">
          <div className="flex items-center justify-center mb-3">
            <QrCode className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-semibold text-center">Scan to pay with any UPI app</h3>
          </div>
          
          {!qrError ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <img 
                  src={UPI_QR_IMAGE_PATH} 
                  alt="UPI Payment QR Code" 
                  className="w-64 h-64 md:w-72 md:h-72 rounded-lg shadow-lg object-contain"
                  onError={() => {
                    console.error('QR code failed to load');
                    setQrError(true);
                  }}
                />
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenQrFullSize}
                  className="gap-2"
                >
                  <Maximize2 className="h-4 w-4" />
                  Open QR Full Size
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Open any UPI app and scan this QR code to pay
              </p>
            </div>
          ) : (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                QR code could not be loaded. Please use the UPI ID below to make your payment manually.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-primary/5 px-2 text-muted-foreground">Or pay manually</span>
          </div>
        </div>

        {/* Manual Payment Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>UPI ID</Label>
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
                onClick={() => handleCopy(UPI_CONFIG.payeeVPA, 'upi')}
              >
                <Copy className={`h-4 w-4 ${copied === 'upi' ? 'text-green-600' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount to Pay</Label>
            <div className="flex gap-2">
              <Input
                value={`₹${amountInRupees}`}
                readOnly
                className="font-mono text-lg font-semibold"
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

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleUpiPayment}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Open UPI App to Pay
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This will open your UPI app with pre-filled payment details
            </p>
          </div>

          {/* Deep link fallback message */}
          {deepLinkFailed && (
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                <strong>UPI app didn't open?</strong> No problem! Use the QR code above or manually enter the UPI ID and amount in your UPI app to complete the payment.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Instructions */}
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-sm font-medium mb-1">Payment Instructions:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Scan the QR code above OR manually enter the UPI ID in your UPI app</li>
            <li>Enter the exact amount shown: ₹{amountInRupees}</li>
            <li>Complete the payment in your UPI app</li>
            <li>Copy the 12-digit UPI Transaction ID (UTR) from your payment confirmation</li>
            <li>Enter the UTR below to complete your donation submission</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
