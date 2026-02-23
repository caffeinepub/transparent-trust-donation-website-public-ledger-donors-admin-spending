import { 
  useGetTrustBalance, 
  useGetTotalDonations, 
  useGetTotalSpending,
  useGetDonations,
  useGetSpendingRecords
} from '@/hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import SpendingBreakdownCard from '@/components/ledger/SpendingBreakdownCard';
import RecentTransactionsList from '@/components/ledger/RecentTransactionsList';
import { formatINR } from '@/utils/formatCurrency';
import { APPROVED_IMAGE_PATH } from '@/utils/approvedImage';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useGetTrustBalance();
  const { data: totalDonations, isLoading: donationsLoading } = useGetTotalDonations();
  const { data: totalSpending, isLoading: spendingLoading } = useGetTotalSpending();
  const { data: recentDonations = [] } = useGetDonations(10, 0);
  const { data: recentSpending = [] } = useGetSpendingRecords(10, 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/40">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Hero Text */}
            <div className="space-y-6 order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Small contributions create big transformations
              </h1>
              <p className="text-xl text-muted-foreground">
                Why Not Us? Together, we can make change visible, transparent, and meaningful.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate({ to: '/donate' })}
                  className="gap-2"
                >
                  <Heart className="h-5 w-5" />
                  Make a Donation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate({ to: '/ledger' })}
                >
                  View Full Ledger
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
                <img 
                  src={APPROVED_IMAGE_PATH} 
                  alt="Why Not Us - Community support and transparent donations"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-primary">{formatINR(balance)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Available funds for community support
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funds in Trust</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">{formatINR(totalDonations)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed contributions received
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount Used</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {spendingLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">{formatINR(totalSpending)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Funds distributed to beneficiaries
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts and Activity Section */}
      <section className="container pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          <SpendingBreakdownCard spendingRecords={recentSpending} />
          <RecentTransactionsList 
            donations={recentDonations} 
            spending={recentSpending} 
          />
        </div>
      </section>
    </div>
  );
}
