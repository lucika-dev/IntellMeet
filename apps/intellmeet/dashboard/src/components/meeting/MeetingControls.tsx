import {
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  Settings,
  SmilePlus,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';

import { Button } from '@wraith/ui/shadcn/button';

interface MeetingControlsProps {
  collapsed?: boolean;

  micEnabled?: boolean;

  cameraEnabled?: boolean;

  onToggleMic?: () => void;

  onToggleCamera?: () => void;

  onOpenChat?: () => void;

  onOpenParticipants?: () => void;

  onOpenReactions?: () => void;

  onToggleScreenShare?: () => void;

  onOpenSettings?: () => void;
}

export const MeetingControls = ({
  collapsed = false,

  micEnabled = true,

  cameraEnabled = true,

  onToggleMic,

  onToggleCamera,

  onOpenChat,

  onOpenParticipants,

  onOpenReactions,

  onToggleScreenShare,

  onOpenSettings,
}: MeetingControlsProps) => {
  const controls = [
    {
      icon: micEnabled
        ? Mic
        : MicOff,

      onClick:
        onToggleMic,
    },

    {
      icon: cameraEnabled
        ? Video
        : VideoOff,

      onClick:
        onToggleCamera,
    },

    {
      icon: Users,

      onClick:
        onOpenParticipants,
    },

    {
      icon: MessageSquare,

      onClick:
        onOpenChat,
    },

    {
      icon: SmilePlus,

      onClick:
        onOpenReactions,
    },

    {
      icon: MonitorUp,

      onClick:
        onToggleScreenShare,
    },

    {
      icon: Settings,

      onClick:
        onOpenSettings,
    },
  ];

  return (
    <div
      className={`
        flex items-center

        ${
          collapsed
            ? 'flex-col gap-3'
            : 'justify-between gap-2'
        }
      `}
    >
      {controls.map(
        (
          Control,
          index,
        ) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="icon"
            onClick={
              Control.onClick
            }
            className="
              h-10 w-10
              shrink-0
            "
          >
            <Control.icon className="size-4" />
          </Button>
        ),
      )}
    </div>
  );
};
