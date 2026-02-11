import { Link } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '@/utils/formatCurrency';

type Transaction = {
  id: string;
  type: 'donation' | 'spending';
  amount: bigint;
  timestamp: bigint;
  description: string;
  status?: string;
};

interface LedgerTableProps {
  transactions: Transaction[];
}

export default function LedgerTable({ transactions }: LedgerTableProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow 
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <Link 
                    to="/transaction/$id" 
                    params={{ id: transaction.id }}
                    className="flex items-center gap-2"
                  >
                    {transaction.type === 'donation' ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Donation</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Spending</span>
                      </>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to="/transaction/$id" params={{ id: transaction.id }}>
                    {transaction.description || 'No description'}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to="/transaction/$id" params={{ id: transaction.id }}>
                    {formatDate(transaction.timestamp)}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <Link to="/transaction/$id" params={{ id: transaction.id }}>
                    {formatINR(transaction.amount)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to="/transaction/$id" params={{ id: transaction.id }}>
                    {getStatusBadge(transaction.status)}
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
