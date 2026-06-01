import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

import type { WorkspaceOrganization } from '../types';

type MembershipRow = {
  organization_id: string;
  role: 'owner' | 'admin' | 'member';
};

type OrganizationRow = {
  id: string;
 name: string;
  slug: string;
  owner_id: string;
  secret_code: string;
  logo_url: string | null;
  created_at: string;
};

export const useOrganizations = () => {
  const userId = useAuthStore(
    (state) => state.user?.id ?? null,
  );

  return useQuery<
    WorkspaceOrganization[]
  >({
    queryKey: [
      'organizations',
      userId,
    ],

    enabled: !!userId,

    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const {
        data: memberships,
        error: membershipsError,
      } = await supabase
        .from(
          'organization_members',
        )
        .select(`
          organization_id,
          role
        `)
        .eq('user_id', userId);

      if (membershipsError) {
        throw membershipsError;
      }

      if (!memberships?.length) {
        return [];
      }

      const organizationIds =
        memberships.map(
          (membership) =>
            membership.organization_id,
        );

      const {
        data: organizationsData,
        error: organizationsError,
      } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          slug,
          owner_id,
          secret_code,
          logo_url,
          created_at
        `)
        .in('id', organizationIds);

      if (organizationsError) {
        throw organizationsError;
      }

      const roleMap = new Map<
        string,
        MembershipRow['role']
      >();

      memberships.forEach(
        (membership) => {
          roleMap.set(
            membership.organization_id,
            membership.role,
          );
        },
      );

      const finalOrganizations =
        (
          organizationsData as OrganizationRow[]
        )?.map((organization) => ({
          ...organization,
          role:
            roleMap.get(
              organization.id,
            ) ?? 'member',
        })) ?? [];

      return finalOrganizations;
    },
  });
};
