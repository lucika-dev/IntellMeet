import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ConnectionState,
  Participant,
  Room,
  RoomEvent,
  Track,
  type RemoteTrackPublication,
  type TrackPublication,
} from 'livekit-client';

import {
  intellmeetRealtimeApi,
  type IntellMeetMeeting,
  type MeetingRole,
} from '../api/intellmeetRealtimeApi';

export type LiveKitMeetingIdentifiers = {
  meetingCode?: string;
  orgSlug?: string;
  channelSlug?: string;
  meetingSlug?: string;
};

export type LiveKitMeetingOptions = {
  enabled?: boolean;
  initialMicEnabled?: boolean;
  initialCameraEnabled?: boolean;
};

export type LiveKitParticipantTile = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isLocal: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  cameraPublication?: TrackPublication;
  screenPublication?: TrackPublication;
  audioPublications: Map<string, RemoteTrackPublication>;
};

const getProfileFromMetadata = (metadata?: string) => {
  if (!metadata) {
    return {
      avatarUrl: null,
    };
  }

  try {
    const parsed = JSON.parse(metadata) as { avatarUrl?: string | null };

    return {
      avatarUrl: parsed.avatarUrl ?? null,
    };
  } catch {
    return {
      avatarUrl: null,
    };
  }
};

const getParticipantName = (participant: Participant) =>
  participant.name || participant.identity;

const getTileFromParticipant = (
  participant: Participant,
  activeSpeakerIds: Set<string>,
): LiveKitParticipantTile => {
  const profile = getProfileFromMetadata(participant.metadata);
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare);
  const audioPublications =
    participant.isLocal
      ? new Map<string, RemoteTrackPublication>()
      : participant.audioTrackPublications as Map<string, RemoteTrackPublication>;

  return {
    id: participant.identity,
    name: getParticipantName(participant),
    avatarUrl: profile.avatarUrl,
    isLocal: participant.isLocal,
    isMuted: !participant.isMicrophoneEnabled,
    isCameraOn: participant.isCameraEnabled,
    isScreenSharing: participant.isScreenShareEnabled,
    isSpeaking: activeSpeakerIds.has(participant.identity),
    cameraPublication,
    screenPublication,
    audioPublications,
  };
};

const buildTiles = (room: Room | null, activeSpeakerIds: Set<string>) => {
  if (!room) {
    return [];
  }

  return [
    getTileFromParticipant(room.localParticipant, activeSpeakerIds),
    ...Array.from(room.remoteParticipants.values()).map((participant) =>
      getTileFromParticipant(participant, activeSpeakerIds),
    ),
  ];
};

const resolveTokenInput = (identifiers: LiveKitMeetingIdentifiers) => {
  if (identifiers.orgSlug && identifiers.channelSlug && identifiers.meetingSlug) {
    return {
      orgSlug: identifiers.orgSlug,
      channelSlug: identifiers.channelSlug,
      meetingSlug: identifiers.meetingSlug,
    };
  }

  return {
    meetingCode: identifiers.meetingCode,
  };
};

export const useLiveKitMeeting = (
  identifiers: LiveKitMeetingIdentifiers,
  options: LiveKitMeetingOptions = {},
) => {
  const {
    meetingCode,
    orgSlug,
    channelSlug,
    meetingSlug,
  } = identifiers;
  const {
    enabled = true,
    initialMicEnabled = true,
    initialCameraEnabled = true,
  } = options;
  const [room, setRoom] = useState<Room | null>(null);
  const [meeting, setMeeting] = useState<IntellMeetMeeting | null>(null);
  const [participantRole, setParticipantRole] = useState<MeetingRole>('guest');
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected,
  );
  const [activeSpeakerIds, setActiveSpeakerIds] = useState<Set<string>>(new Set());
  const [, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const tokenInput = useMemo(
    () =>
      resolveTokenInput({
        meetingCode,
        orgSlug,
        channelSlug,
        meetingSlug,
      }),
    [
      channelSlug,
      meetingCode,
      meetingSlug,
      orgSlug,
    ],
  );
  const missingRoute = !tokenInput.meetingCode && !tokenInput.meetingSlug;

  const bumpRevision = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let currentRoom: Room | null = null;
    let joinedMeetingId: string | null = null;

    if (!enabled || missingRoute) {
      return;
    }

    const connect = async () => {
      try {
        setError(null);
        setMediaError(null);

        const tokenResponse = await intellmeetRealtimeApi.createToken(tokenInput);

        if (!active) {
          return;
        }

        currentRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          stopLocalTrackOnUnpublish: true,
        });

        const handleRefresh = () => bumpRevision();
        const handleConnectionState = (state: ConnectionState) => {
          setConnectionState(state);
        };
        const handleActiveSpeakers = (speakers: Participant[]) => {
          setActiveSpeakerIds(new Set(speakers.map((speaker) => speaker.identity)));
        };

        currentRoom
          .on(RoomEvent.ConnectionStateChanged, handleConnectionState)
          .on(RoomEvent.ParticipantConnected, handleRefresh)
          .on(RoomEvent.ParticipantDisconnected, handleRefresh)
          .on(RoomEvent.TrackSubscribed, handleRefresh)
          .on(RoomEvent.TrackUnsubscribed, handleRefresh)
          .on(RoomEvent.TrackMuted, handleRefresh)
          .on(RoomEvent.TrackUnmuted, handleRefresh)
          .on(RoomEvent.LocalTrackPublished, handleRefresh)
          .on(RoomEvent.LocalTrackUnpublished, handleRefresh)
          .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakers);

        setRoom(currentRoom);
        setMeeting(tokenResponse.meeting);
        joinedMeetingId = tokenResponse.meeting.id;
        setParticipantRole(tokenResponse.participantRole);
        setConnectionState(currentRoom.state);

        await currentRoom.connect(tokenResponse.liveKitUrl, tokenResponse.accessToken);

        if (!active) {
          currentRoom.disconnect();
          return;
        }

        await intellmeetRealtimeApi.joinParticipant(tokenResponse.meeting.id);

        let localMediaError: string | null = null;

        if (initialMicEnabled) {
          try {
            await currentRoom.localParticipant.setMicrophoneEnabled(true);
          } catch {
            localMediaError =
              'Microphone permission was blocked. Use the mic control to try again.';
          }
        }

        if (initialCameraEnabled) {
          try {
            await currentRoom.localParticipant.setCameraEnabled(true);
          } catch {
            localMediaError =
              'Camera permission was blocked. Use the camera control to try again.';
          }
        }

        setMediaError(localMediaError);

        if (mountedRef.current) {
          setConnectionState(currentRoom.state);
          bumpRevision();
        }
      } catch (caught) {
        if (!active) {
          return;
        }

        setError(caught instanceof Error ? caught.message : 'Failed to join meeting');
        setConnectionState(ConnectionState.Disconnected);
      }
    };

    connect();

    return () => {
      active = false;

      if (currentRoom) {
        currentRoom.disconnect();

        if (joinedMeetingId) {
          intellmeetRealtimeApi.leaveParticipant(joinedMeetingId).catch(() => undefined);
        }
      }
    };
  }, [
    bumpRevision,
    enabled,
    initialCameraEnabled,
    initialMicEnabled,
    missingRoute,
    tokenInput,
  ]);

  const participants = buildTiles(room, activeSpeakerIds);

  const toggleMicrophone = useCallback(async () => {
    if (!room) {
      return;
    }

    try {
      await room.localParticipant.setMicrophoneEnabled(
        !room.localParticipant.isMicrophoneEnabled,
      );
      setMediaError(null);
    } catch {
      setMediaError('Microphone permission was blocked by the browser.');
    }
    bumpRevision();
  }, [bumpRevision, room]);

  const toggleCamera = useCallback(async () => {
    if (!room) {
      return;
    }

    try {
      await room.localParticipant.setCameraEnabled(
        !room.localParticipant.isCameraEnabled,
      );
      setMediaError(null);
    } catch {
      setMediaError('Camera permission was blocked by the browser.');
    }
    bumpRevision();
  }, [bumpRevision, room]);

  const toggleScreenShare = useCallback(async () => {
    if (!room) {
      return;
    }

    try {
      await room.localParticipant.setScreenShareEnabled(
        !room.localParticipant.isScreenShareEnabled,
      );
      setMediaError(null);
    } catch {
      setMediaError('Screen sharing could not start. Check browser permissions and try again.');
    }
    bumpRevision();
  }, [bumpRevision, room]);

  const endMeeting = useCallback(async () => {
    if (!meeting) {
      return;
    }

    await intellmeetRealtimeApi.endMeeting(meeting.id);
  }, [meeting]);

  const leaveMeeting = useCallback(async () => {
    if (meeting) {
      await intellmeetRealtimeApi.leaveParticipant(meeting.id);
    }

    room?.disconnect();
  }, [meeting, room]);

  const localParticipant = room?.localParticipant ?? null;

  return {
    room,
    meeting,
    participantRole,
    participants,
    connectionState,
    error: missingRoute ? 'Missing meeting route' : error,
    mediaError,
    micEnabled: localParticipant?.isMicrophoneEnabled ?? false,
    cameraEnabled: localParticipant?.isCameraEnabled ?? false,
    screenShareEnabled: localParticipant?.isScreenShareEnabled ?? false,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    endMeeting,
    leaveMeeting,
  };
};
