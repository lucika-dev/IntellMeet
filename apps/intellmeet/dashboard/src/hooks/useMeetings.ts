import { useQuery } from '@tanstack/react-query';

import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

import type {
  DashboardMeeting,
  RecordedMeeting,
} from '../types';

type MeetingRowResponse = {
  id: string;
  organization_id: string;
  channel_id: string | null;
  title: string;
  description: string | null;
  status: string;
  scheduled_at: string | null;
  thumbnail_url: string | null;
  created_by: string | null;
  created_at: string;

  organization?:
    | {
        id: string;
        name: string;
        logo_url: string | null;
      }
    | {
        id: string;
        name: string;
        logo_url: string | null;
      }[]
    | null;

  channel?:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;

  meeting_participants?: {
    id: string;
  }[];
};

type RecordedMeetingResponse = {
  id: string;
  organization_id: string;
  channel_id: string | null;
  uploaded_by: string | null;
  title: string;
  description: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  created_at: string;

  organization?:
    | {
        id: string;
        name: string;
        logo_url: string | null;
      }
    | {
        id: string;
        name: string;
        logo_url: string | null;
      }[]
    | null;

  channel?:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

const firstRelation = <T,>(
  value:
    | T
    | T[]
    | null
    | undefined,
) =>
  Array.isArray(value)
    ? value[0] ?? null
    : value ?? null;

export const useMeetings = (
  organizationId?: string,
) => {
  const user = useAuthStore(
    (state) => state.user,
  );

  return useQuery<
    DashboardMeeting[]
  >({
    queryKey: [
      'meetings',
      organizationId,
    ],

    enabled: Boolean(
      organizationId,
    ),

    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      const { data, error } =
        await supabase
          .from('meetings')
          .select(`
            id,
            organization_id,
            channel_id,
            title,
            description,
            status,
            scheduled_at,
            thumbnail_url,
            created_by,
            created_at,

            organization:organizations!meetings_organization_id_fkey (
              id,
              name,
              logo_url
            ),

            channel:channels!meetings_channel_id_fkey (
              id,
              name
            ),

            meeting_participants (
              id
            )
          `)
          .eq(
            'organization_id',
            organizationId,
          )
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ).map((meeting) => {
        const row =
          meeting as unknown as MeetingRowResponse;

        return {
          ...row,

          organization:
            firstRelation(
              row.organization,
            ),

          channel:
            firstRelation(
              row.channel,
            ),

          participant_count:
            Array.isArray(
              row.meeting_participants,
            )
              ? row
                  .meeting_participants
                  .length
              : 0,

          creator_label:
            row.created_by ===
            user?.id
              ? user?.name ??
                'You'
              : row.created_by
                ? 'Workspace member'
                : undefined,
        };
      });
    },
  });
};

export const useRecordedMeetings = (
  organizationId?: string,
) => {
  const user = useAuthStore(
    (state) => state.user,
  );

  return useQuery<
    RecordedMeeting[]
  >({
    queryKey: [
      'recorded-meetings',
      organizationId,
    ],

    enabled: Boolean(
      organizationId,
    ),

    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      const { data, error } =
        await supabase
          .from(
            'recorded_meetings',
          )
          .select(`
            id,
            organization_id,
            channel_id,
            uploaded_by,
            title,
            description,
            youtube_url,
            thumbnail_url,
            duration,
            created_at,

            organization:organizations!recorded_meetings_organization_id_fkey (
              id,
              name,
              logo_url
            ),

            channel:channels!recorded_meetings_channel_id_fkey (
              id,
              name
            )
          `)
          .eq(
            'organization_id',
            organizationId,
          )
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ).map((meeting) => {
        const row =
          meeting as unknown as RecordedMeetingResponse;

        return {
          ...row,

          organization:
            firstRelation(
              row.organization,
            ),

          channel:
            firstRelation(
              row.channel,
            ),

          creator_label:
            row.uploaded_by ===
            user?.id
              ? user?.name ??
                'You'
              : row.uploaded_by
                ? 'Workspace member'
                : undefined,
        };
      });
    },
  });
};

export const useLiveMeetings = (
  organizationId?: string,
) => {
  const user = useAuthStore(
    (state) => state.user,
  );

  return useQuery<
    DashboardMeeting[]
  >({
    queryKey: [
      'live-meetings',
      organizationId,
    ],

    enabled: Boolean(
      organizationId,
    ),

    queryFn: async () => {
      if (!organizationId) {
        return [];
      }

      const { data, error } =
        await supabase
          .from('meetings')
          .select(`
            id,
            organization_id,
            channel_id,
            title,
            description,
            status,
            scheduled_at,
            thumbnail_url,
            created_by,
            created_at,

            organization:organizations!meetings_organization_id_fkey (
              id,
              name,
              logo_url
            ),

            channel:channels!meetings_channel_id_fkey (
              id,
              name
            ),

            meeting_participants (
              id
            )
          `)
          .eq(
            'organization_id',
            organizationId,
          )
          .eq('status', 'live')
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ).map((meeting) => {
        const row =
          meeting as unknown as MeetingRowResponse;

        return {
          ...row,

          organization:
            firstRelation(
              row.organization,
            ),

          channel:
            firstRelation(
              row.channel,
            ),

          participant_count:
            Array.isArray(
              row.meeting_participants,
            )
              ? row
                  .meeting_participants
                  .length
              : 0,

          creator_label:
            row.created_by ===
            user?.id
              ? user?.name ??
                'You'
              : row.created_by
                ? 'Workspace member'
                : undefined,
        };
      });
    },
  });
};
