import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { TransactionType, SortOrder } from '@/pages/LedgerPage';

interface LedgerFiltersProps {
  typeFilter: TransactionType;
  setTypeFilter: (type: TransactionType) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

export default function LedgerFilters({
  typeFilter,
  setTypeFilter,
  sortOrder,
  setSortOrder,
}: LedgerFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-lg border border-border bg-card">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="type-filter" className="mb-2 block">Transaction Type</Label>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionType)}>
          <SelectTrigger id="type-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="incoming">Incoming (Donations)</SelectItem>
            <SelectItem value="outgoing">Outgoing (Spending)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="sort-order" className="mb-2 block">Sort By</Label>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger id="sort-order">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
