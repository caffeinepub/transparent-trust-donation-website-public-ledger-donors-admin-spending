import AdminGuard from '@/components/auth/AdminGuard';
import { useGetDonations, useConfirmDonation, useDeclineDonation } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

export default function AdminDonationsPage() {
  return (
    <AdminGuard>
      <AdminDonationsContent />
    </AdminGuard>
  );
}

function AdminDonationsContent() {
  const { data: donations = [], isLoading } = useGetDonations(100, 0);
  const confirmMutation = useConfirmDonation();
  const declineMutation = useDeclineDonation();

  const formatCurrency = (amount: bigint) => {
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleConfirm = async (donationId: string) => {
    try {
      await confirmMutation.mutateAsync(donationId);
      toast.success('Donation confirmed successfully');
    } catch (error) {
      console.error('Confirm error:', error);
      toast.error('Failed to confirm donation');
    }
  };

  const handleDecline = async (donationId: string) => {
    try {
      await declineMutation.mutateAsync(donationId);
      toast.success('Donation declined');
    } catch (error) {
      console.error('Decline error:', error);
      toast.error('Failed to decline donation');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const pendingDonations = donations.filter(d => d.status === 'pending');
  const recentDonations = donations.slice(0, 20);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin: Donation Management</h1>
            <p className="text-muted-foreground">
              Review and confirm incoming donations.
            </p>
          </div>
          <Link to="/admin/spending">
            <Button variant="outline">Manage Spending</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pending Donations ({pendingDonations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : pendingDonations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending donations.</p>
            ) : (
              <div className="space-y-3">
                {pendingDonations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-lg">{formatCurrency(donation.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Donor: {donation.donorId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(donation.timestamp)}
                        </p>
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>
                    {donation.description && (
                      <p className="text-sm mb-3">{donation.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(donation.id)}
                        disabled={confirmMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecline(donation.id)}
                        disabled={declineMutation.isPending}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentDonations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No donations yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentDonations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{formatCurrency(donation.amount)}</p>
                      {getStatusBadge(donation.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(donation.timestamp)} • {donation.donorId}
                    </p>
                    {donation.description && (
                      <p className="text-sm mt-1">{donation.description}</p>
                    )}
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
