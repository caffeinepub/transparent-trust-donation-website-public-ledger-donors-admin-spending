import { useState, useEffect, useRef } from 'react';
import { useSubmitDonation } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Receipt, AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { normalizeIndianPhone, sanitizeAmount, isValidIndianPhone } from '@/utils/donationInputNormalization';
import { generatePaymentReference } from '@/utils/paymentReference';
import { extractCanisterError } from '@/utils/canisterError';
import { fileToUint8Array } from '@/utils/fileToUint8Array';
import { ExternalBlob } from '@/backend';
import UpiPaymentSection from './UpiPaymentSection';

export default function DonationForm() {
  const navigate = useNavigate();
  const submitDonationMutation = useSubmitDonation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Payment reference - stable per amount entry
  const [paymentReference, setPaymentReference] = useState<string>('');

  // Generate payment reference when amount is entered
  useEffect(() => {
    if (amount && parseFloat(amount) >= 10) {
      // Only generate once per amount entry
      if (!paymentReference) {
        setPaymentReference(generatePaymentReference());
      }
    } else {
      setPaymentReference('');
    }
  }, [amount, paymentReference]);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const normalized = normalizeIndianPhone(phone);
      if (!isValidIndianPhone(normalized)) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number (format: +91XXXXXXXXXX, not +910XXXXXXXXX)';
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const sanitized = sanitizeAmount(amount);
    const amountNum = parseFloat(sanitized);
    if (!amount || isNaN(amountNum) || amountNum < 10) {
      newErrors.amount = 'Minimum donation amount is ₹10';
    }

    if (!paymentScreenshot) {
      newErrors.screenshot = 'Payment screenshot is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setPaymentScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const normalizedPhone = normalizeIndianPhone(phone);
      const sanitizedAmount = sanitizeAmount(amount);
      const amountInPaise = BigInt(Math.round(parseFloat(sanitizedAmount) * 100));

      const donorId = `${normalizedPhone}-${Date.now()}`;

      // Convert screenshot to ExternalBlob
      let screenshotBlob: ExternalBlob | null = null;
      if (paymentScreenshot) {
        try {
          const bytes = await fileToUint8Array(paymentScreenshot);
          screenshotBlob = ExternalBlob.fromBytes(bytes as Uint8Array<ArrayBuffer>);
        } catch (error) {
          console.error('Screenshot conversion error:', error);
          toast.error('Failed to process payment screenshot. Please try again.');
          return;
        }
      }

      await submitDonationMutation.mutateAsync({
        donorId,
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        phone: normalizedPhone,
        amount: amountInPaise,
        description: description.trim(),
        paymentScreenshot: screenshotBlob,
      });

      toast.success('Donation submitted successfully! Pending admin verification.');
      
      // Reset form
      setDisplayName('');
      setEmail('');
      setPhone('');
      setAmount('');
      setDescription('');
      setPaymentScreenshot(null);
      setScreenshotPreview(null);
      setPaymentReference('');
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Navigate to ledger
      setTimeout(() => {
        navigate({ to: '/ledger' });
      }, 1500);
    } catch (error: unknown) {
      console.error('Donation submission error:', error);
      const errorMessage = extractCanisterError(error);
      toast.error(errorMessage);
    }
  };

  const amountInPaise = amount && parseFloat(amount) >= 10 
    ? BigInt(Math.round(parseFloat(amount) * 100))
    : BigInt(0);

  return (
    <div className="space-y-6">
      {/* Step 1: UPI Payment Section */}
      {amountInPaise > 0 && (
        <UpiPaymentSection 
          amountInPaise={amountInPaise} 
          paymentReference={paymentReference}
        />
      )}

      {/* Step 2: Donation Details Form */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Step 2: Enter Donation Details
          </CardTitle>
          <CardDescription>
            Fill in your details and upload a screenshot of your successful UPI payment to complete your donation submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
                {errors.displayName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.displayName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Donation Details */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Donation Amount (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="10"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in rupees (minimum ₹10)"
                  required
                />
                {errors.amount && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Message (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a message with your donation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshot">
                  Payment Screenshot <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-3">
                  {!paymentScreenshot ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a screenshot of your successful payment
                      </p>
                      <Input
                        ref={fileInputRef}
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="cursor-pointer"
                        required
                      />
                    </div>
                  ) : (
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {screenshotPreview && (
                          <img 
                            src={screenshotPreview} 
                            alt="Payment screenshot preview" 
                            className="w-24 h-24 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{paymentScreenshot.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(paymentScreenshot.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveScreenshot}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Take a screenshot of the successful payment confirmation from your UPI app
                </p>
                {errors.screenshot && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.screenshot}
                  </p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={submitDonationMutation.isPending}
            >
              {submitDonationMutation.isPending ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Submit Donation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
