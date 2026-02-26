import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetSiteMetrics, useGetTrustBalance } from '@/hooks/useQueries';
import { formatINR } from '@/utils/formatCurrency';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPortalPage() {
  const { data: metrics, isLoading: metricsLoading } = useGetSiteMetrics();
  const { data: balance, isLoading: balanceLoading } = useGetTrustBalance();

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Portal</h1>
            <p className="text-muted-foreground">
              Manage donations, spending, and transparency data
            </p>
          </div>
        </div>

        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Notice</AlertTitle>
          <AlertDescription>
            All actions you take in the Admin Portal directly affect the public transparency data displayed on the website. 
            Confirming donations adds them to the public ledger, and recording spending updates the trust balance visible to all donors.
          </AlertDescription>
        </Alert>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatINR(balance)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Available for spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Site Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.totalSiteViews ? Number(metrics.totalSiteViews).toLocaleString() : '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              All-time visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Viewers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics?.currentLiveViewers ? Number(metrics.currentLiveViewers).toLocaleString() : '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Currently online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Manage Donations</CardTitle>
            </div>
            <CardDescription>
              Review pending donations, verify UPI transaction details, and confirm or decline donation requests. 
              Confirmed donations are added to the public ledger and update the trust balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/donations">
              <Button className="w-full" size="lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                Go to Donations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Manage Spending</CardTitle>
            </div>
            <CardDescription>
              Record new spending transactions and view spending history. 
              All spending records are publicly visible on the ledger and reduce the trust balance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/spending">
              <Button className="w-full" size="lg" variant="secondary">
                <DollarSign className="h-4 w-4 mr-2" />
                Go to Spending
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Admin Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Verify UPI Transactions:</strong> Always cross-check the UTR (UPI Transaction Reference) 
                and UPI token with your bank statement before confirming donations.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Record Spending Accurately:</strong> Provide clear descriptions for all spending records 
                to maintain transparency with donors.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>
                <strong>Public Accountability:</strong> Remember that all confirmed donations and spending records 
                are immediately visible to the public on the ledger page.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
