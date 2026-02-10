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

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: balance, isLoading: balanceLoading } = useGetTrustBalance();
  const { data: totalDonations, isLoading: donationsLoading } = useGetTotalDonations();
  const { data: totalSpending, isLoading: spendingLoading } = useGetTotalSpending();
  const { data: recentDonations = [] } = useGetDonations(10, 0);
  const { data: recentSpending = [] } = useGetSpendingRecords(10, 0);

  const formatCurrency = (amount: bigint | undefined) => {
    if (amount === undefined) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border/40">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Building Hope Through Transparent Giving
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Every donation is tracked, every expense is visible. Join us in making a real difference 
                for those who need it most.
              </p>
              <div className="flex flex-wrap gap-4">
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
            <div className="relative">
              <img 
                src="/assets/generated/trust-hero.dim_1600x600.png" 
                alt="Community Support" 
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Available for community support
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold text-chart-1">{formatCurrency(totalDonations)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Confirmed contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {spendingLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold text-chart-2">{formatCurrency(totalSpending)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Invested in community
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Spending Breakdown */}
      <section className="container pb-12">
        <SpendingBreakdownCard spendingRecords={recentSpending} />
      </section>

      {/* Recent Activity */}
      <section className="container pb-16">
        <RecentTransactionsList 
          donations={recentDonations} 
          spending={recentSpending} 
        />
      </section>
    </div>
  );
}
