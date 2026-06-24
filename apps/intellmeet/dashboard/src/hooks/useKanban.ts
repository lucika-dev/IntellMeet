import { useEffect } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { supabase } from '@wraith/auth/client';

export type KanbanTask = {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  position: number;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export const useKanbanTasks = (
  organizationId?: string,
) => {
  const queryClient =
    useQueryClient();

  const query = useQuery({
    queryKey: [
      'kanban',
      organizationId,
    ],

    enabled:
      !!organizationId,

    retry: 1,

    queryFn: async () => {
      const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  throw new Error(
    'No authenticated session',
  );
}

      console.log(
        'KANBAN USER:',
        session?.user?.id,
      );

      console.log(
        'KANBAN ORG:',
        organizationId,
      );

      const {
        data,
        error,
      } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq(
          'organization_id',
          organizationId!,
        )
        .order('position', {
          ascending: true,
        });

      console.log(
        'KANBAN DATA:',
        data,
      );

      console.log(
        'KANBAN ERROR:',
        error,
      );

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ) as KanbanTask[];
    },
  });

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    const channel =
      supabase
        .channel(
          `kanban-${organizationId}`,
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table:
              'kanban_tasks',
            filter: `organization_id=eq.${organizationId}`,
          },
          () => {
            queryClient.invalidateQueries(
              {
                queryKey: [
                  'kanban',
                  organizationId,
                ],
              },
            );
          },
        )
        .subscribe((status) => {
  console.log(
    'KANBAN CHANNEL STATUS:',
    status,
  );
});

    return () => {
    void supabase.removeChannel(channel);
    };
  }, [
    organizationId,
    queryClient,
  ]);

  return query;
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      title,
      description,
      assignedTo,
    }: {
      organizationId: string;
      title: string;
      description?: string;
      assignedTo?: string | null;
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error(
          'Not authenticated',
        );
      }

      const {
        data: existing,
      } = await supabase
        .from('kanban_tasks')
        .select('position')
        .eq(
          'organization_id',
          organizationId,
        )
        .eq('status', 'todo')
        .order('position', {
          ascending: false,
        })
        .limit(1);

      const nextPosition =
        existing?.length
          ? existing[0].position + 1
          : 0;

      const {
        data,
        error,
      } = await supabase
        .from('kanban_tasks')
        .insert({
          organization_id:
            organizationId,
          title,
          description:
            description ?? null,
          status: 'todo',
          position:
            nextPosition,
          created_by:
            session.user.id,
          assigned_to:
            assignedTo ?? null,
        })
        .select();

      console.log(
        'TASK INSERT DATA:',
        data,
      );

      console.log(
        'TASK INSERT ERROR:',
        error,
      );

      if (error) {
        throw error;
      }
    },

    onSuccess: (
      _,
      variables,
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          'kanban',
          variables.organizationId,
        ],
      });
    },
  });
};

export const useMoveTask =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: async ({
        id,
        status,
        position,
      }: {
        id: string;
        status:
          | 'todo'
          | 'in_progress'
          | 'done';
        position: number;
      }) => {
        const {
          error,
        } = await supabase
          .from('kanban_tasks')
          .update({
            status,
            position,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          throw error;
        }
      },

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              'kanban',
            ],
          },
        );
      },
    });
  };

export const useUpdateTask =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: async ({
        id,
        title,
        description,
        assignedTo,
      }: {
        id: string;
        title: string;
        description?: string;
        assignedTo?: string | null;
      }) => {
        const {
          error,
        } = await supabase
          .from('kanban_tasks')
          .update({
            title,
            description:
              description ??
              null,
            assigned_to:
              assignedTo ??
              null,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', id);

        if (error) {
          throw error;
        }
      },

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              'kanban',
            ],
          },
        );
      },
    });
  };

export const useDeleteTask =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: async (
        id: string,
      ) => {
        const {
          error,
        } = await supabase
          .from('kanban_tasks')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }
      },

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              'kanban',
            ],
          },
        );
      },
    });
  };