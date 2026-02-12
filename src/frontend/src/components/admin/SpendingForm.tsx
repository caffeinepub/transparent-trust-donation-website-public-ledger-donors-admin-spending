import { useState } from 'react';
import { useAddSpendingRecord, useGetTrustBalance } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SpendingForm() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const addSpending = useAddSpendingRecord();
  const { data: balance } = useGetTrustBalance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    // Convert rupees to paise (minor units)
    const amountInPaise = BigInt(Math.round(amountValue * 100));

    // Check if spending exceeds balance
    if (balance !== undefined && amountInPaise > balance) {
      toast.error('Spending amount exceeds available balance');
      return;
    }

    try {
      await addSpending.mutateAsync({
        amount: amountInPaise,
        description: description.trim(),
      });
      toast.success('Spending recorded successfully. Your partner has been notified.');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error('Spending error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add spending record';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (INR) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in rupees"
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter the amount spent in Indian Rupees
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this spending was for (e.g., food supplies, medical expenses)"
          rows={4}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={addSpending.isPending}
      >
        {addSpending.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          'Record Spending'
        )}
      </Button>
    </form>
  );
}
