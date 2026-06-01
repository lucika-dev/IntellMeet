import {
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react';
import type {
  LocalVideoTrack,
  RemoteVideoTrack,
} from 'livekit-client';

import type { LiveKitParticipantTile } from '../../hooks/useLiveKitMeeting';
import { LiveKitVideo } from '../../components/meeting/LiveKitVideo';

interface ParticipantTileProps {
  participant: LiveKitParticipantTile;

  pinned?: boolean;
}

export const ParticipantTile = ({
  participant,

  pinned = false,
}: ParticipantTileProps) => {
  const videoTrack =
    participant.screenPublication?.videoTrack ??
    participant.cameraPublication?.videoTrack;

  return (
    <div
      className={`
        relative overflow-hidden
        border border-border
        bg-card

        ${
          pinned
            ? 'min-h-[520px]'
            : 'aspect-video min-h-[220px]'
        }
      `}
    >
      <div
        className="
          absolute inset-0
          flex items-center
          justify-center
          bg-muted
        "
      >
        {videoTrack ? (
          <LiveKitVideo
            track={videoTrack as LocalVideoTrack | RemoteVideoTrack}
            muted={participant.isLocal}
          />
        ) : participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="
              flex size-24
              items-center
              justify-center
              bg-background
              text-3xl
              font-semibold
            "
          >
            {participant.name[0]}
          </div>
        )}
      </div>

      <div
        className="
          absolute inset-x-0 bottom-0
          flex items-center
          justify-between
          bg-gradient-to-t
          from-black/70 to-transparent
          p-4 text-white
        "
      >
        <span
          className="
            truncate text-sm
            font-medium
          "
        >
          {participant.name}
        </span>

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
      </div>
    </div>
  );
};
