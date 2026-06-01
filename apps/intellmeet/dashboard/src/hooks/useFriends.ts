import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { socialApi } from '../api/socialApi';
import { useAuthStore } from '../store/authStore';

export const useFriends = () => {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: ['friends', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { friends } = await socialApi.fetchFriends();
      return friends;
    },
  });
};

export const useFriendRequests = () => {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: ['friendRequests', userId],
    enabled: !!userId,
    queryFn: socialApi.fetchFriendRequests,
  });
};

export const useUserSearch = (query: string) => {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const trimmedQuery = query.trim();

  return useQuery({
    queryKey: ['userSearch', userId, trimmedQuery],
    enabled: !!userId && trimmedQuery.length >= 2,
    queryFn: async () => {
      const { users } = await socialApi.searchUsers(trimmedQuery);
      return users;
    },
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialApi.sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialApi.acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },
  });
};

export const useDeclineFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: socialApi.declineFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userSearch'] });
    },
  });
};
