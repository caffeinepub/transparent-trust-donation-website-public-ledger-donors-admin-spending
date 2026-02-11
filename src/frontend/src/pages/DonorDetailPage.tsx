import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetDonorProfile, useGetDonorPublicProfile, useGetDonorDonations } from '@/hooks/useQueries';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Mail, Phone, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatINR } from '@/utils/formatCurrency';

export default function DonorDetailPage() {
  const { id } = useParams({ from: '/donor/$id' });
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useAdminStatus();

  const { data: fullProfile, isLoading: fullLoading } = useGetDonorProfile(id);
  const { data: publicProfile, isLoading: publicLoading } = useGetDonorPublicProfile(id);
  const { data: donations = [], isLoading: donationsLoading } = useGetDonorDonations(id);

  const isLoading = adminLoading || (isAdmin ? fullLoading : publicLoading) || donationsLoading;
  const profile = isAdmin ? fullProfile : publicProfile;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (!profile) {
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

  // Determine phone display based on profile type
  const displayPhone = isAdmin && 'phone' in profile
    ? profile.phone
    : 'maskedPhone' in profile
    ? profile.maskedPhone
    : undefined;

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
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(profile.displayName || 'Anonymous')}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{profile.displayName || 'Anonymous'}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                  <p className="text-xl font-bold text-chart-1">{formatINR(profile.totalDonated)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(profile.joinedTimestamp)}</p>
                </div>
              </div>

              {profile.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{profile.email}</p>
                  </div>
                </div>
              )}

              {displayPhone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{displayPhone}</p>
                  </div>
                </div>
              )}

              {profile.principal && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Principal ID</p>
                    <p className="font-mono text-xs break-all">{profile.principal.toString()}</p>
                  </div>
                </div>
              )}
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
                    className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate({ to: '/transaction/$id', params: { id: donation.id } })}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-lg text-chart-1">{formatINR(donation.amount)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(donation.timestamp)}</p>
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>
                    {donation.description && (
                      <p className="text-sm mt-2">{donation.description}</p>
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
