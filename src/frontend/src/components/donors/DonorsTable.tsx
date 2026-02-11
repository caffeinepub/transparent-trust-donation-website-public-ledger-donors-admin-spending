import { useNavigate } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatINR } from '@/utils/formatCurrency';

interface DonorProfile {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  joinedTimestamp: bigint;
  totalDonated: bigint;
}

interface DonorsTableProps {
  donors: DonorProfile[];
}

export default function DonorsTable({ donors }: DonorsTableProps) {
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Member Since</TableHead>
            <TableHead className="text-right">Total Donated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donors.map((donor) => (
            <TableRow
              key={donor.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => navigate({ to: '/donor/$id', params: { id: donor.id } })}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(donor.displayName || 'Anonymous')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{donor.displayName || 'Anonymous'}</p>
                    {donor.email && (
                      <p className="text-sm text-muted-foreground">{donor.email}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(donor.joinedTimestamp)}
              </TableCell>
              <TableCell className="text-right font-bold text-chart-1">
                {formatINR(donor.totalDonated)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
