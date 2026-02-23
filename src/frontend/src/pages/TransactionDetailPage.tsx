import { useParams, Link } from '@tanstack/react-router';
import { useGetDonations, useGetSpendingRecords, useGetProverbForDonation } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import ProverbFeedbackPrompt from '@/components/feedback/ProverbFeedbackPrompt';
import { Gender } from '@/backend';

export default function TransactionDetailPage() {
  const { id } = useParams({ from: '/transaction/$id' });
  const { identity } = useInternetIdentity();
  const { data: donations = [], isLoading: donationsLoading } = useGetDonations(1000, 0);
  const { data: spending = [], isLoading: spendingLoading } = useGetSpendingRecords(1000, 0);

  const isLoading = donationsLoading || spendingLoading;

  // Find the transaction
  const donation = donations.find(d => d.id === id);
  const spendingRecord = spending.find(s => s.id === id);

  // Check if we should show proverb prompt
  const shouldShowProverb = 
    !!donation && 
    donation.status === 'confirmed' && 
    donation.donorGender === Gender.female &&
    donation.proverbFeedback === undefined;

  // Fetch proverb only if conditions are met
  const { data: proverbs = [], isLoading: proverbLoading } = useGetProverbForDonation(id);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
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
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!donation && !spendingRecord) {
    return (
      <div className="container py-12">
        <Link to="/ledger">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ledger
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Transaction not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDonation = !!donation;
  const transaction = donation || spendingRecord;

  if (!transaction) {
    return null;
  }

  // Select a random proverb from the list (stable per page load)
  const selectedProverb = proverbs.length > 0 ? proverbs[Math.floor(Math.random() * proverbs.length)] : null;

  return (
    <div className="container py-12 space-y-6">
      <Link to="/ledger">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Ledger
        </Button>
      </Link>

      {/* Proverb Feedback Prompt - Only for confirmed female donations without feedback */}
      {shouldShowProverb && !proverbLoading && selectedProverb && identity && (
        <ProverbFeedbackPrompt donationId={id} proverb={selectedProverb} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDonation ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-green-600">Donation Details</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-red-600">Spending Details</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold">{formatINR(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <p className="text-lg">{formatDate(transaction.timestamp)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-base">{transaction.description || 'No description provided'}</p>
          </div>

          {isDonation && donation && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Donor ID</p>
                <p className="font-mono text-sm">{donation.donorId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                {getStatusBadge(donation.status)}
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
            <p className="font-mono text-sm">{transaction.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
