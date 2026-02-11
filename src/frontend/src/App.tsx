import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import SiteLayout from './components/layout/SiteLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import LedgerPage from './pages/LedgerPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import DonorsPage from './pages/DonorsPage';
import DonorDetailPage from './pages/DonorDetailPage';
import DonatePage from './pages/DonatePage';
import AdminPortalPage from './pages/admin/AdminPortalPage';
import AdminSpendingPage from './pages/admin/AdminSpendingPage';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';

// Root route for public pages with SiteLayout
const rootRoute = createRootRoute({
  component: SiteLayout,
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const ledgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ledger',
  component: LedgerPage,
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transaction/$id',
  component: TransactionDetailPage,
});

const donorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/donors',
  component: DonorsPage,
});

const donorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/donor/$id',
  component: DonorDetailPage,
});

const donateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/donate',
  component: DonatePage,
});

// Admin root route with AdminLayout
const adminRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
});

// Admin child routes
const adminIndexRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/',
  component: AdminPortalPage,
});

const adminSpendingRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/spending',
  component: AdminSpendingPage,
});

const adminDonationsRoute = createRoute({
  getParentRoute: () => adminRootRoute,
  path: '/donations',
  component: AdminDonationsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  ledgerRoute,
  transactionDetailRoute,
  donorsRoute,
  donorDetailRoute,
  donateRoute,
  adminRootRoute.addChildren([
    adminIndexRoute,
    adminSpendingRoute,
    adminDonationsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
