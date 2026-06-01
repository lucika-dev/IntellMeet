import {
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react';

import type { LiveKitParticipantTile } from '../../hooks/useLiveKitMeeting';
import { useMeetingStore } from '../../store/meetingStore';

interface ParticipantsPanelProps {
  participants: LiveKitParticipantTile[];
}

export const ParticipantsPanel = ({
  participants,
}: ParticipantsPanelProps) => {
  const {
    pinnedParticipantId,
    setPinnedParticipant,
  } = useMeetingStore();

  return (
    <aside
      className="
        flex h-full w-[340px]
        shrink-0 flex-col
        border-l border-border
        bg-background
      "
    >
      <div
        className="
          border-b border-border
          px-5 py-4
        "
      >
        <h2
          className="
            text-base font-semibold
          "
        >
          Participants
        </h2>
      </div>

      <div
        className="
          flex-1 overflow-y-auto
          p-4
        "
      >
        <div
          className="
            flex flex-col gap-3
          "
        >
          {participants.map(
            (participant) => {
              const isPinned =
                pinnedParticipantId ===
                participant.id;

              return (
                <button
                  key={
                    participant.id
                  }
                  type="button"
                  onClick={() =>
                    setPinnedParticipant(
                      isPinned
                        ? null
                        : participant.id,
                    )
                  }
                  className={`
                    flex items-center
                    justify-between
                    border border-border
                    px-4 py-3
                    text-left
                    transition-colors

                    ${
                      isPinned
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }
                  `}
                >
                  <div
                    className="
                      flex min-w-0
                      items-center gap-3
                    "
                  >
                    <div
                      className="
                        flex size-11
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        bg-muted
                        text-sm font-semibold
                      "
                    >
                      {participant.avatarUrl ? (
                        <img
                          src={participant.avatarUrl}
                          alt={participant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        participant.name[0]
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className="
                          truncate text-sm
                          font-medium
                        "
                      >
                        {participant.name}
                      </div>

                      <div
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        {isPinned
                          ? 'Pinned'
                          : participant.isLocal
                            ? 'You'
                            : 'Participant'}
                      </div>
                    </div>
                  </div>

                  <div
                    className="
                      flex items-center gap-2
                    "
                  >
                    {participant.isMuted ? (
                      <MicOff className="size-4" />
                    ) : (
                      <Mic className="size-4" />
                    )}

                    {participant.isCameraOn ? (
                      <Video className="size-4" />
                    ) : (
                      <VideoOff className="size-4" />
                    )}
                  </div>
                </button>
              );
            },
          )}
        </div>
      </div>
    </aside>
  );
};
