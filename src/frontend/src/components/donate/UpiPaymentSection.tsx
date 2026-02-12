import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Smartphone, Info } from 'lucide-react';
import { toast } from 'sonner';
import { UPI_CONFIG, generateUpiIntent } from '@/config/upi';

interface UpiPaymentSectionProps {
  amountInPaise: bigint;
}

export default function UpiPaymentSection({ amountInPaise }: UpiPaymentSectionProps) {
  const [copied, setCopied] = useState<'upi' | 'amount' | null>(null);
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
      toast.error('Could not open UPI app. Please use the manual payment method.');
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Step 1: Pay via UPI
        </CardTitle>
        <CardDescription>
          Use the UPI ID below to pay the exact amount, then enter your 12-digit UTR to complete your donation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Details */}
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
                <strong>UPI app didn't open?</strong> No problem! Manually enter the UPI ID and amount in your UPI app to complete the payment.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Payment Instructions */}
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-sm font-medium mb-1">Payment Instructions:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
            <li>Enter the UPI ID shown above or use the "Open UPI App" button</li>
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
