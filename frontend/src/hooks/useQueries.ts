import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Metrics, DonorPublicProfile, ActivityEntry } from '../backend';
import { ExternalBlob } from '../backend';

// Dashboard queries
export function useGetTrustBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['trustBalance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTrustBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalDonations() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalDonations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTotalDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalSpending() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalSpending'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTotalSpending();
    },
    enabled: !!actor && !isFetching,
  });
}

// Site metrics queries - Public, resilient for anonymous users
export function useGetSiteMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery<Metrics>({
    queryKey: ['siteMetrics'],
    queryFn: async () => {
      if (!actor) {
        // Return safe default instead of throwing
        return {
          totalSiteViews: BigInt(0),
          currentLiveViewers: BigInt(0),
        };
      }
      try {
        return await actor.getSiteMetrics();
      } catch (error) {
        console.error('Error fetching site metrics:', error);
        // Return safe default on error
        return {
          totalSiteViews: BigInt(0),
          currentLiveViewers: BigInt(0),
        };
      }
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Donation queries
export function useGetDonations(limit: number = 50, offset: number = 0) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['donations', limit, offset],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDonations(BigInt(limit), BigInt(offset));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDonorDonations(donorId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['donorDonations', donorId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDonorDonations(donorId);
    },
    enabled: !!actor && !isFetching && !!donorId,
  });
}

export function useSubmitDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      donorId: string;
      amount: bigint;
      description: string;
      displayName: string;
      email?: string;
      phone: string;
      paymentScreenshot: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitDonation(
        input.donorId,
        input.amount,
        input.description,
        input.displayName,
        input.email || null,
        input.phone,
        input.paymentScreenshot
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['trustBalance'] });
      queryClient.invalidateQueries({ queryKey: ['totalDonations'] });
    },
  });
}

// Admin donation management
export function useConfirmDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmDonation(donationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['trustBalance'] });
      queryClient.invalidateQueries({ queryKey: ['totalDonations'] });
      queryClient.invalidateQueries({ queryKey: ['donorProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['donorPublicProfiles'] });
    },
  });
}

export function useDeclineDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.declineDonation(donationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

// Spending queries
export function useGetSpendingRecords(limit: number = 50, offset: number = 0) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['spendingRecords', limit, offset],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSpendingRecords(BigInt(limit), BigInt(offset));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSpendingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, description }: { amount: bigint; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSpendingRecord(amount, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spendingRecords'] });
      queryClient.invalidateQueries({ queryKey: ['trustBalance'] });
      queryClient.invalidateQueries({ queryKey: ['totalSpending'] });
    },
  });
}

// Donor queries
export function useGetDonorPublicProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<DonorPublicProfile[]>({
    queryKey: ['donorPublicProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDonorPublicProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDonorProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['donorProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDonorProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDonorPublicProfile(donorId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['donorPublicProfile', donorId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDonorPublicProfile(donorId);
    },
    enabled: !!actor && !isFetching && !!donorId,
  });
}

export function useGetDonorProfile(donorId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['donorProfile', donorId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDonorProfile(donorId);
    },
    enabled: !!actor && !isFetching && !!donorId,
  });
}

// User profile queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Contact form queries
export function useGetContactFormEntries() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['contactFormEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getContactFormEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitContactForm() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      phone: string;
      message: string;
      inquiryType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitContactForm(
        input.name,
        input.email,
        input.phone,
        input.message,
        input.inquiryType as any
      );
    },
  });
}

// Proverb queries
export function useGetProverbForDonation(donationId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['proverbs', donationId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProverbsForDonation(donationId);
    },
    enabled: !!actor && !isFetching && !!donationId,
  });
}

export function useRecordProverbFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ donationId, isLiked }: { donationId: string; isLiked: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordProverbFeedback(donationId, isLiked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

// Service activity queries
export function useGetAllServiceActivities(limit: number = 50, offset: number = 0) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivityEntry[]>({
    queryKey: ['serviceActivities', limit, offset],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllServiceActivities(BigInt(limit), BigInt(offset));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddServiceActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      images: ExternalBlob[];
      author: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addServiceActivity(
        input.title,
        input.description,
        input.images,
        input.author,
        input.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceActivities'] });
    },
  });
}

export function useUpdateServiceActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      title: string;
      description: string;
      images: ExternalBlob[];
      author: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServiceActivity(
        input.id,
        input.title,
        input.description,
        input.images,
        input.author,
        input.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceActivities'] });
    },
  });
}

export function useDeleteServiceActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteServiceActivity(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceActivities'] });
    },
  });
}
