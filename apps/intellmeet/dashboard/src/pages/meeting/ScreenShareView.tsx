import type {
  LocalVideoTrack,
  RemoteVideoTrack,
} from 'livekit-client';

import { LiveKitVideo } from '../../components/meeting/LiveKitVideo';
import type { LiveKitParticipantTile } from '../../hooks/useLiveKitMeeting';

import { ParticipantTile } from './ParticipantTile';

interface ScreenShareViewProps {
  presenter: LiveKitParticipantTile;
}

export const ScreenShareView = ({
  presenter,
}: ScreenShareViewProps) => {
  const screenTrack = presenter.screenPublication?.videoTrack;

  return (
    <div
      className="
        relative h-full w-full
        overflow-hidden
        bg-background
      "
    >
      <div
        className="
          absolute inset-0
          overflow-hidden
          border border-border
          bg-card
        "
      >
        {screenTrack ? (
          <LiveKitVideo
            track={screenTrack as LocalVideoTrack | RemoteVideoTrack}
            muted={presenter.isLocal}
          />
        ) : (
          <div
            className="
              flex h-full flex-col
              items-center justify-center
              gap-3 text-center
            "
          >
            <div
              className="
                text-2xl font-semibold
              "
            >
              Screen Sharing
            </div>

            <div
              className="
                text-sm
                text-muted-foreground
              "
            >
              Waiting for shared content
            </div>
          </div>
        )}
      </div>

      <div
        className="
          absolute bottom-6 right-6
          w-[280px]
        "
      >
        <ParticipantTile
          participant={presenter}
        />
      </div>
    </div>
  );
};
