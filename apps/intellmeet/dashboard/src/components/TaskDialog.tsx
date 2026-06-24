import { useState } from 'react';
import type { ReactNode } from 'react';

import toast from 'react-hot-toast';

import { Button } from '@wraith/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@wraith/ui/shadcn/dialog';
import { Input } from '@wraith/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@wraith/ui/shadcn/select';
import { Textarea } from '@wraith/ui/shadcn/textarea';

import { useCreateTask } from '../hooks/useKanban';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useWorkspaceSelection } from '../hooks/useWorkspaceSelection';

type Props = {
  trigger: ReactNode;
};

export const TaskDialog = ({
  trigger,
}: Props) => {
  const { activeOrganization } =
    useWorkspaceSelection();

  const {
    data: members = [],
  } = useTeamMembers();

  const createTask =
    useCreateTask();

    const [open, setOpen] =
    useState(false);

  const [title, setTitle] =
    useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    assignedTo,
    setAssignedTo,
  ] = useState('unassigned');

  const handleCreate =
    async () => {
      if (
        !activeOrganization?.id
      ) {
        toast.error(
          'Select an organization first',
        );
        return;
      }

      if (!title.trim()) {
        toast.error(
          'Task title required',
        );
        return;
      }

      try {
        await createTask.mutateAsync({
          organizationId:
            activeOrganization.id,

          title:
            title.trim(),

          description:
            description.trim() ||
            undefined,

          assignedTo:
            assignedTo ===
            'unassigned'
              ? null
              : assignedTo,
        });

        toast.success(
          'Task created',
        );

        setTitle('');
        setDescription('');
        setAssignedTo(
          'unassigned',
        );

        setOpen(false);
      } catch (error) {
        console.error(
          'TASK CREATE ERROR',
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to create task',
        );
      }
    };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="z-[99999] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Create Task
          </DialogTitle>

          <DialogDescription>
            Add a task to your
            organization board.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value,
              )
            }
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
            className="min-h-28"
          />

          <Select
            value={assignedTo}
            onValueChange={
              setAssignedTo
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign member" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="unassigned">
                Unassigned
              </SelectItem>

              {members.map(
                (member) => (
                  <SelectItem
                    key={member.id}
                    value={member.id}
                  >
                    {member.name}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            disabled={
              createTask.isPending
            }
            onClick={
              handleCreate
            }
          >
            {createTask.isPending
              ? 'Creating...'
              : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};