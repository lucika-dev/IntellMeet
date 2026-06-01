import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import type { TeamMember, UserRole } from '../types';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

type OrganizationMemberRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  title: string | null;
  joined_at: string;
  invited_by: string | null;
};

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  google_photo: string | null;
  user_photo: string | null;
  avatar_url: string | null;
};

const toInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const mapRole = (role: string): UserRole =>
  role === 'owner' || role === 'admin'
    ? 'admin'
    : 'account';

const toMember = (
  membership: OrganizationMemberRow,
  profile: ProfileRow | undefined,
): TeamMember => {
  const name =
    profile?.name ||
    profile?.username ||
    profile?.email?.split('@')[0] ||
    'Workspace member';

  return {
    id: membership.id,
    name,
    email: profile?.email ?? '',
    role: mapRole(membership.role),
    avatarInitials: toInitials(name),
    dateAdded: membership.joined_at,
    lastActive: membership.joined_at,
  };
};

export const useTeamMembers = () => {
  const organizationId = useWorkspaceStore(
    (state) => state.selectedOrganizationId,
  );

  return useQuery({
    queryKey: ['teamMembers', organizationId],
    enabled: !!organizationId,
    queryFn: async () => {
      const {
        data: memberships,
        error: membershipsError,
      } = await supabase
        .from('organization_members')
        .select('id, organization_id, user_id, role, title, joined_at, invited_by')
        .eq('organization_id', organizationId)
        .order('joined_at', { ascending: false });

      if (membershipsError) {
        throw membershipsError;
      }

      const userIds = (memberships ?? []).map(
        (membership) => membership.user_id,
      );

      const {
        data: profiles,
        error: profilesError,
      } = userIds.length
        ? await supabase
            .from('profiles')
            .select('id, name, email, username, google_photo, user_photo, avatar_url')
            .in('id', userIds)
        : { data: [], error: null };

      if (profilesError) {
        throw profilesError;
      }

      const profilesById = new Map(
        (profiles ?? []).map((profile) => [
          profile.id,
          profile as ProfileRow,
        ]),
      );

      return (memberships ?? []).map((membership) =>
        toMember(
          membership as OrganizationMemberRow,
          profilesById.get(membership.user_id),
        ),
      );
    },
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();
  const organizationId = useWorkspaceStore(
    (state) => state.selectedOrganizationId,
  );

  return useMutation({
    mutationFn: async (member: Omit<TeamMember, 'id'>) => {
      if (!organizationId) {
        throw new Error('Select an organization first');
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', member.email)
        .maybeSingle<{ id: string }>();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('No user profile found for that email');
      }

      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: profile.id,
          role: member.role === 'admin' ? 'admin' : 'member',
          title: null,
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['teamMembers'],
      }),
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TeamMember>;
    }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({
          role: updates.role === 'admin' ? 'admin' : 'member',
        })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['teamMembers'],
      }),
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['teamMembers'],
      }),
  });
};
