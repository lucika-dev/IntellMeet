import type { RemoteAudioTrack } from 'livekit-client';

import { LiveKitAudio } from '../../components/meeting/LiveKitAudio';
import type { LiveKitParticipantTile } from '../../hooks/useLiveKitMeeting';
import { useMeetingStore } from '../../store/meetingStore';

import { ParticipantTile } from './ParticipantTile';
import { ScreenShareView } from './ScreenShareView';

interface MeetingGridProps {
  participants: LiveKitParticipantTile[];
}

const AudioTracks = ({
  participants,
}: MeetingGridProps) => {
  return (
    <>
      {participants.flatMap((participant) =>
        participant.isLocal
          ? []
          : Array.from(
              participant.audioPublications.values(),
            ).map((publication) => (
              <LiveKitAudio
                key={publication.trackSid}
                track={publication.audioTrack as RemoteAudioTrack | undefined}
              />
            )),
      )}
    </>
  );
};

export const MeetingGrid = ({
  participants,
}: MeetingGridProps) => {
  const pinnedParticipantId = useMeetingStore(
    (state) => state.pinnedParticipantId,
  );

  const screenShareParticipant =
    participants.find(
      (participant) =>
        participant.isScreenSharing,
    ) ?? null;

  const pinnedParticipant =
    participants.find(
      (participant) =>
        participant.id === pinnedParticipantId,
    ) ??
    screenShareParticipant ??
    null;

  if (screenShareParticipant) {
    return (
      <>
        <ScreenShareView presenter={screenShareParticipant} />
        <AudioTracks participants={participants} />
      </>
    );
  }

  if (
    pinnedParticipant &&
    participants.length > 1
  ) {
    const secondaryParticipants =
      participants.filter(
        (participant) =>
          participant.id !==
          pinnedParticipant.id,
      );

    return (
      <>
        <div
          className="
            flex h-full gap-4
          "
        >
          <div className="flex-1">
            <ParticipantTile
              participant={
                pinnedParticipant
              }
              pinned
            />
          </div>

          <div
            className="
              flex w-[340px]
              flex-col gap-4
              overflow-y-auto
            "
          >
            {secondaryParticipants.map(
              (
                participant,
              ) => (
                <ParticipantTile
                  key={
                    participant.id
                  }
                  participant={
                    participant
                  }
                />
              ),
            )}
          </div>
        </div>

        <AudioTracks participants={participants} />
      </>
    );
  }

  return (
    <>
      <div
        className="
          grid h-full w-full
          grid-cols-1 gap-4
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {participants.map(
          (participant) => (
            <ParticipantTile
              key={participant.id}
              participant={
                participant
              }
            />
          ),
        )}
      </div>

      <AudioTracks participants={participants} />
    </>
  );
};
