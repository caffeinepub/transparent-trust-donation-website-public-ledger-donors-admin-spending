import { useState } from 'react';
import { useAddSpendingRecord, useGetTrustBalance } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SpendingForm() {
  const addSpending = useAddSpendingRecord();
  const { data: balance } = useGetTrustBalance();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    const amountInCents = BigInt(Math.round(amountNum * 100));
    
    // Check if spending would make balance negative
    if (balance !== undefined && amountInCents > balance) {
      toast.error('Insufficient balance for this spending amount');
      return;
    }

    try {
      await addSpending.mutateAsync({
        amount: amountInCents,
        description: description.trim(),
      });
      toast.success('Spending record added successfully');
      setAmount('');
      setDescription('');
    } catch (error: any) {
      console.error('Spending error:', error);
      if (error.message?.includes('Insufficient')) {
        toast.error('Insufficient balance for this spending amount');
      } else {
        toast.error('Failed to add spending record. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spending-amount">Amount (USD) *</Label>
        <Input
          id="spending-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="100.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="spending-description">Description / Purpose *</Label>
        <Textarea
          id="spending-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe how the funds were used (e.g., 'Food supplies for 20 families', 'School supplies for orphanage')..."
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
