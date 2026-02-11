import { useGetDonations, useConfirmDonation, useDeclineDonation } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, TrendingUp, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '@/utils/formatCurrency';
import { useState } from 'react';

export default function AdminDonationsPage() {
  const { data: donations = [], isLoading } = useGetDonations(100, 0);
  const confirmMutation = useConfirmDonation();
  const declineMutation = useDeclineDonation();
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

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

  const handleCopyUtr = async (utr: string) => {
    try {
      await navigator.clipboard.writeText(utr);
      setCopiedUtr(utr);
      toast.success('UTR copied to clipboard');
      setTimeout(() => setCopiedUtr(null), 2000);
    } catch (error) {
      toast.error('Failed to copy UTR');
    }
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
        <h1 className="text-3xl font-bold mb-2">Donation Management</h1>
        <p className="text-muted-foreground">
          Review and verify UPI payments before confirming donations.
        </p>
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
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : pendingDonations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending donations.</p>
            ) : (
              <div className="space-y-3">
                {pendingDonations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-lg">{formatINR(donation.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Donor: {donation.donorId.substring(0, 20)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(donation.timestamp)}
                        </p>
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>
                    {donation.description && (
                      <p className="text-sm mb-3 italic">"{donation.description}"</p>
                    )}
                    
                    {/* UPI Transaction Details */}
                    <div className="bg-muted/50 rounded p-3 mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">UTR:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                            {donation.utr}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUtr(donation.utr)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className={`h-3 w-3 ${copiedUtr === donation.utr ? 'text-green-600' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(donation.id)}
                        disabled={confirmMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecline(donation.id)}
                        disabled={declineMutation.isPending}
                        className="flex-1"
                      >
                        <X className="mr-1 h-4 w-4" />
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
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentDonations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No donations yet.</p>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{formatINR(donation.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(donation.timestamp)}
                        </p>
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>
                    {donation.description && (
                      <p className="text-xs mt-2 text-muted-foreground italic">
                        "{donation.description}"
                      </p>
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
