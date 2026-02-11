import { useState, useEffect } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useAddDonation } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import UpiPaymentSection from './UpiPaymentSection';
import { 
  normalizeIndianPhone, 
  normalizeUtr, 
  sanitizeAmount,
  isValidIndianPhone,
  isValidUtr
} from '@/utils/donationInputNormalization';

export default function DonationForm() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const addDonation = useAddDonation();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [utr, setUtr] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const isAuthenticated = !!identity;

  // Pre-fill form with user profile data if authenticated
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      setDisplayName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '+91');
    }
  }, [isAuthenticated, userProfile]);

  // Sanitize and parse amount
  const sanitizedAmount = sanitizeAmount(amount);
  const amountValue = parseFloat(sanitizedAmount);
  const isValidAmount = !isNaN(amountValue) && amountValue >= 10;
  const amountInPaise = isValidAmount ? BigInt(Math.round(amountValue * 100)) : BigInt(0);

  // Normalize and validate phone
  const phoneToUse = isAuthenticated && userProfile?.phone ? userProfile.phone : phone;
  const normalizedPhone = normalizeIndianPhone(phoneToUse);
  const isPhoneValid = isValidIndianPhone(normalizedPhone);

  // Normalize and validate UTR
  const normalizedUtr = normalizeUtr(utr);
  const isUtrValid = isValidUtr(normalizedUtr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous success state when starting new submission
    setSubmissionSuccess(false);

    if (!isValidAmount) {
      toast.error('Please enter a valid donation amount (minimum ₹10)');
      return;
    }

    // Validate phone number using normalized value
    if (!isPhoneValid) {
      toast.error('Please enter a valid 10-digit Indian mobile number with +91 country code');
      return;
    }

    if (!isAuthenticated && !displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!isUtrValid) {
      toast.error('Please enter a valid 12-digit UPI Transaction ID (UTR)');
      return;
    }

    // Generate donor ID
    const donorId = isAuthenticated && identity
      ? identity.getPrincipal().toString()
      : `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      await addDonation.mutateAsync({
        donorId,
        amount: amountInPaise,
        description: description.trim(),
        displayName: isAuthenticated && userProfile ? userProfile.name : displayName.trim(),
        email: email.trim() || undefined,
        phone: normalizedPhone, // Use normalized phone
        utr: normalizedUtr, // Use normalized UTR
      });

      toast.success('Donation submitted successfully! Our admin team will verify your payment and confirm shortly.');
      
      // Set success state to show thank you message
      setSubmissionSuccess(true);

      // Reset form
      setAmount('');
      setDescription('');
      setUtr('');
      if (!isAuthenticated) {
        setDisplayName('');
        setEmail('');
        setPhone('+91');
      }
    } catch (error: any) {
      console.error('Donation error:', error);
      // Display backend error message directly to user
      const errorMessage = error?.message || 'Failed to submit donation. Please check your details and try again.';
      toast.error(errorMessage);
    }
  };

  // Show thank you message after successful submission
  if (submissionSuccess) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </div>
            <CardTitle className="text-2xl">Thank You for Your Donation!</CardTitle>
          </div>
          <CardDescription className="text-base">
            Your generosity makes a real difference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="text-foreground">
              We have received your donation submission and truly appreciate your support. Your contribution will help us continue our mission to serve those in need.
            </p>
            <div className="p-4 bg-background/50 rounded-lg border border-primary/20">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                What happens next?
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside ml-1">
                <li>Our admin team will verify your payment using the UTR you provided</li>
                <li>Once verified, your donation will be confirmed and added to our public ledger</li>
                <li>You can track your contribution and see how funds are being used transparently</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Thank you for trusting us with your donation. Together, we can make a positive impact in our community.
            </p>
          </div>
          <Button 
            onClick={() => setSubmissionSuccess(false)} 
            className="w-full"
            size="lg"
          >
            Make Another Donation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 0: Donor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              0
            </span>
            Your Information
          </CardTitle>
          <CardDescription>
            {isAuthenticated 
              ? 'Your profile information will be used for this donation'
              : 'Please provide your details to proceed'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
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
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number (required) *</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneToUse}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
              disabled={isAuthenticated && !!userProfile?.phone}
              className={isPhoneValid ? 'border-green-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {isAuthenticated && userProfile?.phone 
                ? 'Using phone number from your profile'
                : 'Enter your 10-digit mobile number with +91 (spaces/hyphens OK)'
              }
            </p>
            {phoneToUse && phoneToUse !== '+91' && !isPhoneValid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalid phone format. Use +91 followed by 10 digits (6-9 first)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (INR) *</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in rupees (minimum ₹10)"
              required
            />
            {isValidAmount && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Amount: ₹{amountValue.toFixed(2)}
              </p>
            )}
            {amount && !isValidAmount && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Minimum amount is ₹10
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Message (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a message with your donation"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: UPI Payment */}
      {isValidAmount && (
        <UpiPaymentSection amountInPaise={amountInPaise} />
      )}

      {/* Step 2: Payment Confirmation */}
      {isValidAmount && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </span>
              Enter Payment Details
            </CardTitle>
            <CardDescription>
              After completing the UPI payment, enter your transaction ID below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="utr">UPI Transaction ID / UTR (12 digits) *</Label>
              <Input
                id="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter 12-digit UTR (spaces OK)"
                required
                className={isUtrValid ? 'border-green-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Find this in your UPI app's payment confirmation screen (12-digit number)
              </p>
              {utr && !isUtrValid && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  UTR must be exactly 12 characters
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={addDonation.isPending || !isValidAmount || !isUtrValid || !isPhoneValid}
        size="lg"
      >
        {addDonation.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Donation for Verification'
        )}
      </Button>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Important Notes:</p>
        <ul className="space-y-1 list-disc list-inside text-xs">
          <li>Complete the UPI payment first before submitting this form</li>
          <li>Your donation will be verified by our admin team using the UTR you provide</li>
          <li>Once verified, your donation will be confirmed and added to the public ledger</li>
          <li>Mobile number is mandatory for all donations for verification purposes</li>
        </ul>
      </div>
    </form>
  );
}
