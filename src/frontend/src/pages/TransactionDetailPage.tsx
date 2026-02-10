import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetDonations, useGetSpendingRecords } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, FileText, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type DonationRecord = {
  id: string;
  donorId: string;
  amount: bigint;
  timestamp: bigint;
  description: string;
  status: string;
};

type SpendingRecord = {
  id: string;
  amount: bigint;
  timestamp: bigint;
  description: string;
};

export default function TransactionDetailPage() {
  const { id } = useParams({ from: '/transaction/$id' });
  const navigate = useNavigate();
  
  const { data: donations = [], isLoading: donationsLoading } = useGetDonations(1000, 0);
  const { data: spending = [], isLoading: spendingLoading } = useGetSpendingRecords(1000, 0);

  const isLoading = donationsLoading || spendingLoading;

  const donation = donations.find(d => d.id === id);
  const spendingRecord = spending.find(s => s.id === id);
  const transaction = donation || spendingRecord;
  const isDonation = !!donation;

  const formatCurrency = (amount: bigint) => {
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
          <Button onClick={() => navigate({ to: '/ledger' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ledger
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate({ to: '/ledger' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Ledger
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                {isDonation ? 'Donation' : 'Spending'} Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">Transaction ID: {transaction.id}</p>
            </div>
            {isDonation && donation && (
              getStatusBadge(donation.status)
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(transaction.amount)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{formatDate(transaction.timestamp)}</p>
              </div>
            </div>

            {isDonation && donation && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Donor ID</p>
                  <p className="font-medium">{donation.donorId}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 md:col-span-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{transaction.description || 'No description provided'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
