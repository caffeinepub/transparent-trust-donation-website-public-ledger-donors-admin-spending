import { useState, useMemo } from 'react';
import { useGetDonations, useGetSpendingRecords } from '@/hooks/useQueries';
import LedgerFilters from '@/components/ledger/LedgerFilters';
import LedgerTable from '@/components/ledger/LedgerTable';
import { Skeleton } from '@/components/ui/skeleton';

export type TransactionType = 'all' | 'incoming' | 'outgoing';
export type SortOrder = 'newest' | 'oldest';

export default function LedgerPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  
  const { data: donations = [], isLoading: donationsLoading } = useGetDonations(1000, 0);
  const { data: spending = [], isLoading: spendingLoading } = useGetSpendingRecords(1000, 0);

  const isLoading = donationsLoading || spendingLoading;

  const transactions = useMemo(() => {
    let combined: Array<{ type: 'donation' | 'spending'; data: any }> = [];

    if (typeFilter === 'all' || typeFilter === 'incoming') {
      combined = [...combined, ...donations.map(d => ({ type: 'donation' as const, data: d }))];
    }

    if (typeFilter === 'all' || typeFilter === 'outgoing') {
      combined = [...combined, ...spending.map(s => ({ type: 'spending' as const, data: s }))];
    }

    // Sort by timestamp
    combined.sort((a, b) => {
      const timeA = Number(a.data.timestamp);
      const timeB = Number(b.data.timestamp);
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return combined;
  }, [donations, spending, typeFilter, sortOrder]);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction Ledger</h1>
        <p className="text-muted-foreground">
          Complete transparency: every donation received and every dollar spent.
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
