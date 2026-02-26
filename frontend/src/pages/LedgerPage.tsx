import { useState, useMemo } from 'react';
import { useGetDonations, useGetSpendingRecords } from '@/hooks/useQueries';
import LedgerFilters from '@/components/ledger/LedgerFilters';
import LedgerTable from '@/components/ledger/LedgerTable';
import { Skeleton } from '@/components/ui/skeleton';

export type TransactionType = 'all' | 'incoming' | 'outgoing';
export type SortOrder = 'newest' | 'oldest';

type Transaction = {
  id: string;
  type: 'donation' | 'spending';
  amount: bigint;
  timestamp: bigint;
  description: string;
  status?: string;
};

export default function LedgerPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  
  const { data: donations = [], isLoading: donationsLoading } = useGetDonations(1000, 0);
  const { data: spending = [], isLoading: spendingLoading } = useGetSpendingRecords(1000, 0);

  const isLoading = donationsLoading || spendingLoading;

  const transactions = useMemo(() => {
    let combined: Transaction[] = [];

    if (typeFilter === 'all' || typeFilter === 'incoming') {
      combined = [
        ...combined,
        ...donations.map(d => ({
          id: d.id,
          type: 'donation' as const,
          amount: d.amount,
          timestamp: d.timestamp,
          description: d.description,
          status: d.status,
        }))
      ];
    }

    if (typeFilter === 'all' || typeFilter === 'outgoing') {
      combined = [
        ...combined,
        ...spending.map(s => ({
          id: s.id,
          type: 'spending' as const,
          amount: s.amount,
          timestamp: s.timestamp,
          description: s.description,
        }))
      ];
    }

    // Sort by timestamp
    combined.sort((a, b) => {
      const timeA = Number(a.timestamp);
      const timeB = Number(b.timestamp);
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return combined;
  }, [donations, spending, typeFilter, sortOrder]);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction Ledger</h1>
        <p className="text-muted-foreground">
          Complete transparency: every donation received and every rupee spent.
        </p>
      </div>

      <LedgerFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No transactions found.</p>
        </div>
      ) : (
        <LedgerTable transactions={transactions} />
      )}
    </div>
  );
}
