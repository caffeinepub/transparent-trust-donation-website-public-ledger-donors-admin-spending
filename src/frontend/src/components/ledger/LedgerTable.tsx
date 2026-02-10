import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  type: 'donation' | 'spending';
  data: any;
}

interface LedgerTableProps {
  transactions: Transaction[];
}

export default function LedgerTable({ transactions }: LedgerTableProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: bigint) => {
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const isDonation = transaction.type === 'donation';
            const data = transaction.data;

            return (
              <TableRow
                key={`${transaction.type}-${data.id}`}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => navigate({ to: '/transaction/$id', params: { id: data.id } })}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isDonation ? (
                      <ArrowDownRight className="h-4 w-4 text-chart-1" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-chart-2" />
                    )}
                    <span className="text-sm font-medium">
                      {isDonation ? 'In' : 'Out'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {data.description || 'No description'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(data.timestamp)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className={isDonation ? 'text-chart-1' : 'text-chart-2'}>
                    {isDonation ? '+' : '-'}{formatCurrency(data.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {isDonation && 'status' in data ? (
                    <Badge variant={data.status === 'confirmed' ? 'default' : 'secondary'}>
                      {data.status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
