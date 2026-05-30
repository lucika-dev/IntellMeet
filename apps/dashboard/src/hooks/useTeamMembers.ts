import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/mockApi';
import type { TeamMember } from '../types';

export const useTeamMembers = () => useQuery({ queryKey: ['teamMembers'], queryFn: api.fetchAllMembers });

export const useAddMember = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (member: Omit<TeamMember, 'id'>) => api.addMember(member), 
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teamMembers'] }) 
  });
};

export const useUpdateMember = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TeamMember> }) => api.updateMember(id, updates), 
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teamMembers'] }) 
  });
};

export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({ 
    mutationFn: (id: string) => api.deleteMember(id), 
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teamMembers'] }) 
  });
};
