import {
  Clock3,
  Lock,
  PhoneOff,
  Signal,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { Button } from '@wraith/ui/shadcn/button';

interface MeetingTopOverlayProps {
  connectionState?: string;

  duration?: string;

  isHost?: boolean;

  onLeave?: () => void;

  onEnd?: () => void;
}

export const MeetingTopOverlay = ({
  connectionState = 'Connected',

  duration = '00:00:00',

  isHost = false,

  onLeave,

  onEnd,
}: MeetingTopOverlayProps) => {
  const navigate =
    useNavigate();

  const handleLeaveMeeting =
    async () => {
      if (isHost) {
        const shouldEnd =
          window.confirm(
            'End meeting for everyone?',
          );

        if (!shouldEnd) {
          return;
        }

        await onEnd?.();

        navigate('/dashboard');

        return;
      }

      await onLeave?.();

      navigate('/dashboard');
    };

  return (
    <div
      className="
        absolute inset-x-0 top-0
        z-20 flex items-center
        justify-between
        p-6
      "
    >
      <div
        className="
          flex items-center gap-3
        "
      >
        <div
          className="
            flex items-center gap-2
            border border-border
            bg-background/90
            px-4 py-2
            backdrop-blur
          "
        >
          <Lock className="size-4" />

          <span
            className="
              text-sm font-medium
            "
          >
            End-to-end encrypted
          </span>
        </div>

        <div
          className="
            flex items-center gap-2
            border border-border
            bg-background/90
            px-4 py-2
            backdrop-blur
          "
        >
          <Signal className="size-4" />

          <span
            className="
              text-sm font-medium
            "
          >
            {connectionState}
          </span>
        </div>
      </div>

      <div
        className="
          flex items-center gap-3
        "
      >
        <div
          className="
            flex items-center gap-2
            border border-border
            bg-background/90
            px-4 py-2
            backdrop-blur
          "
        >
          <Clock3 className="size-4" />

          <span
            className="
              text-sm font-medium
            "
          >
            {duration}
          </span>
        </div>

        <Button
        
          type="button"
          variant="destructive"
          onClick={
            handleLeaveMeeting
          }
          className="
            h-11 gap-2
          "
        >
          <PhoneOff className="size-4" />

          <span>
            {isHost
              ? 'End Meeting'
              : 'Leave'}
          </span>
        </Button>
      </div>
    </div>
  );
};
