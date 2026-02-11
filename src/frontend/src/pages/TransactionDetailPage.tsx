import { useParams, Link } from '@tanstack/react-router';
import { useGetDonations, useGetSpendingRecords } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';
import { maskUtr } from '@/utils/maskUtr';

export default function TransactionDetailPage() {
  const { id } = useParams({ from: '/transaction/$id' });
  const { data: donations = [], isLoading: donationsLoading } = useGetDonations(1000, 0);
  const { data: spending = [], isLoading: spendingLoading } = useGetSpendingRecords(1000, 0);

  const isLoading = donationsLoading || spendingLoading;

  // Find the transaction
  const donation = donations.find(d => d.id === id);
  const spendingRecord = spending.find(s => s.id === id);
  const transaction = donation || spendingRecord;

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
        <Skeleton className="h-96 w-full max-w-2xl mx-auto" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Transaction not found</p>
            <Link to="/ledger">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ledger
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDonation = !!donation;

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/ledger">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ledger
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isDonation ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  {isDonation ? (
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isDonation ? 'Donation' : 'Spending'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transaction ID: {transaction.id}
                  </p>
                </div>
              </div>
              {isDonation && donation && getStatusBadge(donation.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-2xl font-bold">{formatINR(transaction.amount)}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(transaction.timestamp)}</span>
              </div>

              {transaction.description && (
                <div className="py-3 border-b">
                  <span className="text-muted-foreground block mb-2">Description</span>
                  <p className="font-medium">{transaction.description}</p>
                </div>
              )}

              {isDonation && donation && (
                <>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Donor ID</span>
                    <Link to="/donor/$id" params={{ id: donation.donorId }}>
                      <Button variant="link" className="p-0 h-auto font-mono text-xs">
                        {donation.donorId.substring(0, 20)}...
                      </Button>
                    </Link>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Payment Reference</span>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {maskUtr(donation.utr)}
                    </code>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge(donation.status)}
                  </div>
                </>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                {isDonation 
                  ? 'This donation has been recorded on the blockchain and is publicly visible in the ledger.'
                  : 'This spending record has been recorded on the blockchain and is publicly visible in the ledger.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
