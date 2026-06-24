import { useState } from 'react';

import { ClipboardList, Plus } from 'lucide-react';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';

import { CSS } from '@dnd-kit/utilities';

import { Button } from '@wraith/ui/shadcn/button';

import { PageTransition } from '../components/PageTransition';
import { TaskDialog } from '../components/TaskDialog';

import {
  useKanbanTasks,
  useMoveTask,
  type KanbanTask,
} from '../hooks/useKanban';

import { useWorkspaceSelection } from '../hooks/useWorkspaceSelection';

function TaskCard({
  task,
}: {
  task: KanbanTask;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform:
      CSS.Translate.toString(
        transform,
      ),
    zIndex: isDragging
      ? 9999
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg border border-border bg-background p-4 shadow-sm transition-colors hover:bg-muted/40 active:cursor-grabbing"
    >
      <h3 className="font-medium text-foreground">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {task.assigned_to
            ? 'Assigned'
            : 'Unassigned'}
        </span>

        <span>
          {new Date(
            task.created_at,
          ).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function Column({
  id,
  title,
  tasks,
  isLoading,
}: {
  id: string;
  title: string;
  tasks: KanbanTask[];
  isLoading: boolean;
}) {
  const { setNodeRef } =
    useDroppable({
      id,
    });

  return (
    <section
      ref={setNodeRef}
      className="flex min-h-0 flex-col border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">
          {title}
        </h2>

        <span className="rounded-full bg-muted px-2 py-1 text-xs">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-visible p-4">
        {isLoading ? (
          <div className="flex h-full min-h-32 items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex h-full min-h-32 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <div className="flex size-10 items-center justify-center border border-border bg-background">
                <ClipboardList className="size-5" />
              </div>

              <p>No tasks</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const KanbanBoardPage =
  () => {
    const {
      activeOrganization,
    } =
      useWorkspaceSelection();

    const {
      data: tasks = [],
      isLoading,
    } = useKanbanTasks(
      activeOrganization?.id,
    );

    const moveTask =
      useMoveTask();

    const [
      activeTaskId,
      setActiveTaskId,
    ] = useState<
      string | null
    >(null);

    const activeTask =
      tasks.find(
        (task) =>
          task.id ===
          activeTaskId,
      ) ?? null;

    const columns = [
      {
        id: 'todo',
        title: 'To Do',
        tasks: tasks.filter(
          (task) =>
            task.status ===
            'todo',
        ),
      },
      {
        id: 'in_progress',
        title:
          'In Progress',
        tasks: tasks.filter(
          (task) =>
            task.status ===
            'in_progress',
        ),
      },
      {
        id: 'done',
        title: 'Done',
        tasks: tasks.filter(
          (task) =>
            task.status ===
            'done',
        ),
      },
    ];

    const onDragStart = (
      event: DragStartEvent,
    ) => {
      setActiveTaskId(
        String(
          event.active.id,
        ),
      );
    };

    const onDragCancel =
      () => {
        setActiveTaskId(
          null,
        );
      };

    const onDragEnd =
      async (
        event: DragEndEvent,
      ) => {
        setActiveTaskId(
          null,
        );

        const {
          active,
          over,
        } = event;

        if (!over) {
          return;
        }

        const task =
          tasks.find(
            (t) =>
              t.id ===
              active.id,
          );

        if (!task) {
          return;
        }

        const targetColumn =
          over.id as
            | 'todo'
            | 'in_progress'
            | 'done';

        if (
          task.status ===
          targetColumn
        ) {
          return;
        }

        try {
          await moveTask.mutateAsync(
            {
              id: task.id,
              status:
                targetColumn,
              position: 0,
            },
          );
        } catch (
          error
        ) {
          console.error(
            error,
          );
        }
      };

    return (
      <PageTransition>
        <div className="flex h-full min-h-0 flex-col gap-6 overflow-visible p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {activeOrganization?.name ??
                  'Workspace'}{' '}
                Project Board
              </h1>

              <p className="mt-1 text-muted-foreground">
                Collaborate
                with your
                team and
                track
                project
                progress in
                real time.
              </p>
            </div>

            <TaskDialog
              trigger={
                <Button className="gap-2">
                  <Plus className="size-4" />
                  New Task
                </Button>
              }
            />
          </div>

          <DndContext
            collisionDetection={
              closestCenter
            }
            onDragStart={
              onDragStart
            }
            onDragEnd={
              onDragEnd
            }
            onDragCancel={
              onDragCancel
            }
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
              {columns.map(
                (
                  column,
                ) => (
                  <Column
                    key={
                      column.id
                    }
                    id={
                      column.id
                    }
                    title={
                      column.title
                    }
                    tasks={
                      column.tasks
                    }
                    isLoading={
                      isLoading
                    }
                  />
                ),
              )}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div
                  className="w-[320px] rounded-lg border border-border bg-background p-4 shadow-2xl"
                  style={{
                    zIndex:
                      99999,
                  }}
                >
                  <h3 className="font-medium text-foreground">
                    {
                      activeTask.title
                    }
                  </h3>

                  {activeTask.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {
                        activeTask.description
                      }
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {activeTask.assigned_to
                        ? 'Assigned'
                        : 'Unassigned'}
                    </span>

                    <span>
                      {new Date(
                        activeTask.created_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </PageTransition>
    );
  };