import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DonationInput, UserProfile } from '../backend';

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

// Donations queries
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

// Donor queries
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

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Mutations
export function useAddDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationInput: DonationInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDonation(donationInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['trustBalance'] });
      queryClient.invalidateQueries({ queryKey: ['totalDonations'] });
      queryClient.invalidateQueries({ queryKey: ['donorProfiles'] });
    },
  });
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
