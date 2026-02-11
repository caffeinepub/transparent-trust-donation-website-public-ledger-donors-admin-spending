import { useGetDonorProfiles, useGetDonorPublicProfiles } from '@/hooks/useQueries';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import DonorsTable from '@/components/donors/DonorsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function DonorsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  
  // Fetch admin profiles only if user is admin
  const { data: adminDonors = [], isLoading: adminDonorsLoading } = useGetDonorProfiles(isAdmin);
  
  // Fetch public profiles only if user is not admin
  const { data: publicDonors = [], isLoading: publicDonorsLoading } = useGetDonorPublicProfiles(!isAdmin);
  
  // Use the appropriate data based on admin status
  const donors = isAdmin ? adminDonors : publicDonors;
  const isLoading = adminLoading || (isAdmin ? adminDonorsLoading : publicDonorsLoading);

  return (
    <div className="container py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Our Donors</h1>
        </div>
        <p className="text-muted-foreground">
          Thank you to all our generous supporters who make our mission possible.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No donors yet. Be the first to contribute!</p>
        </div>
      ) : (
        <DonorsTable donors={donors} />
      )}
    </div>
  );
}
