import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetDonorProfile, useGetDonorDonations } from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Mail, Phone, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DonorDetailPage() {
  const { id } = useParams({ from: '/donor/$id' });
  const navigate = useNavigate();
  
  const { data: donor, isLoading: donorLoading } = useGetDonorProfile(id);
  const { data: donations = [], isLoading: donationsLoading } = useGetDonorDonations(id);

  const isLoading = donorLoading || donationsLoading;

  const formatCurrency = (amount: bigint) => {
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      confirmed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Donor Not Found</h1>
          <Button onClick={() => navigate({ to: '/donors' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button 
        variant="ghost" 
        onClick={() => navigate({ to: '/donors' })}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Donors
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Donor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{donor.displayName || 'Anonymous'}</p>
              </div>
            </div>

            {donor.email && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{donor.email}</p>
                </div>
              </div>
            )}

            {donor.phone && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{donor.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">{formatDate(donor.joinedTimestamp)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Donated</p>
                <p className="text-2xl font-bold">{formatCurrency(donor.totalDonated)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No donations yet.</p>
            ) : (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div 
                    key={donation.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{formatCurrency(donation.amount)}</p>
                        {getStatusBadge(donation.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(donation.timestamp)}
                      </p>
                      {donation.description && (
                        <p className="text-sm mt-1">{donation.description}</p>
                      )}
                    </div>
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
