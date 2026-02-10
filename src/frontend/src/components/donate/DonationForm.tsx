import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useAddDonation } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DonationInput } from '../../backend';

export default function DonationForm() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const addDonation = useAddDonation();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!isAuthenticated && !displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const donorId = isAuthenticated 
      ? identity.getPrincipal().toString()
      : `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const donationInput: DonationInput = {
      donorId,
      amount: BigInt(Math.round(amountNum * 100)),
      description: description.trim(),
      displayName: isAuthenticated ? (userProfile?.name || 'Anonymous') : displayName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    try {
      await addDonation.mutateAsync(donationInput);
      toast.success('Thank you for your donation! It will be reviewed by our team.');
      navigate({ to: '/ledger' });
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to submit donation. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Donation Amount (USD) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100.00"
          required
        />
      </div>

      {!isAuthenticated && (
        <>
          <div className="space-y-2">
            <Label htmlFor="displayName">Your Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
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

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Message (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share why you're donating or leave a message..."
          rows={4}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={addDonation.isPending}
        size="lg"
      >
        {addDonation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Submit Donation'
        )}
      </Button>

      {!isAuthenticated && (
        <p className="text-sm text-muted-foreground text-center">
          Want to track your donations? <button type="button" className="text-primary hover:underline">Sign in</button> before donating.
        </p>
      )}
    </form>
  );
}
