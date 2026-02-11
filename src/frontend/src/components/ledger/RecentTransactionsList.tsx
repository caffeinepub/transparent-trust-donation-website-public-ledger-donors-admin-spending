import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { formatINR } from '@/utils/formatCurrency';

interface DonationRecord {
  id: string;
  donorId: string;
  amount: bigint;
  timestamp: bigint;
  description: string;
  status: string;
}

interface SpendingRecord {
  id: string;
  amount: bigint;
  timestamp: bigint;
  description: string;
}

interface RecentTransactionsListProps {
  donations: DonationRecord[];
  spending: SpendingRecord[];
}

export default function RecentTransactionsList({ donations, spending }: RecentTransactionsListProps) {
  const navigate = useNavigate();

  const recentTransactions = useMemo(() => {
    const combined = [
      ...donations.map(d => ({ type: 'donation' as const, data: d, timestamp: d.timestamp })),
      ...spending.map(s => ({ type: 'spending' as const, data: s, timestamp: s.timestamp })),
    ];

    combined.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    return combined.slice(0, 10);
  }, [donations, spending]);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ to: '/ledger' })}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const isDonation = transaction.type === 'donation';
              const data = transaction.data;

              return (
                <div
                  key={`${transaction.type}-${data.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate({ to: '/transaction/$id', params: { id: data.id } })}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-full ${isDonation ? 'bg-chart-1/10' : 'bg-chart-2/10'}`}>
                      {isDonation ? (
                        <ArrowDownRight className="h-4 w-4 text-chart-1" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-chart-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{isDonation ? 'Donation' : 'Spending'}</p>
                        {isDonation && 'status' in data && (
                          <Badge variant={data.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                            {data.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {data.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(data.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDonation ? 'text-chart-1' : 'text-chart-2'}`}>
                      {isDonation ? '+' : '-'}{formatINR(data.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
