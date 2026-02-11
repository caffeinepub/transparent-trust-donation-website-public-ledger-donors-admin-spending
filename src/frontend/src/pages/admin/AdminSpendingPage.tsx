import SpendingForm from '@/components/admin/SpendingForm';
import { useGetSpendingRecords, useGetTrustBalance } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR } from '@/utils/formatCurrency';

export default function AdminSpendingPage() {
  const { data: balance, isLoading: balanceLoading } = useGetTrustBalance();
  const { data: recentSpending = [], isLoading: spendingLoading } = useGetSpendingRecords(10, 0);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Spending Management</h1>
        <p className="text-muted-foreground">
          Record and manage trust spending for transparency.
        </p>

        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-3xl font-bold">{formatINR(balance)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record New Spending</CardTitle>
            <CardDescription>
              Add a new spending record to the public ledger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Recent Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {spendingLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentSpending.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No spending records yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSpending.map((spending) => (
                  <div 
                    key={spending.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{formatINR(spending.amount)}</p>
                      <Badge variant="secondary">{formatDate(spending.timestamp)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{spending.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
