import {
  useMemo,
  useState,
} from 'react';

import { useLocation, useParams } from 'react-router-dom';

import { Sidebar } from '../../components/Sidebar';

import { ChatPanel } from '../../components/meeting/ChatPanel';
import { LiveTranscriptOverlay } from '../../components/meeting/LiveTranscriptOverlay';
import { MeetingBottomOverlay } from '../../components/meeting/MeetingBottomOverlay';
import { ParticipantsPanel } from '../../components/meeting/ParticipantsPanel';
import { ReactionsLayer } from '../../components/meeting/ReactionsLayer';
import { TranscriptPanel } from '../../components/meeting/TranscriptPanel';

import { useLiveKitMeeting } from '../../hooks/useLiveKitMeeting';
import { useLiveTranscription } from '../../hooks/useLiveTranscription';
import { useMeetingStore } from '../../store/meetingStore';

import { MeetingGrid } from './MeetingGrid';
import { MeetingLayout } from './MeetingLayout';
import { MeetingPermissionPrompt } from './MeetingPermissionPrompt';
import { MeetingTopOverlay } from './MeetingTopOverlay';

export const MeetingPage = () => {
  const location = useLocation();
  const params = useParams();
  const [joinPreferences, setJoinPreferences] = useState<{
    micEnabled: boolean;
    cameraEnabled: boolean;
  } | null>(null);

  const {
    chatOpen,
    participantsOpen,
    transcriptOpen,
    toggleChat,
    toggleParticipants,
    toggleTranscript,
    toggleReactions,
  } = useMeetingStore();

  const isOrganizationMeeting = useMemo(
    () => location.pathname.startsWith('/org/'),
    [location.pathname],
  );

  const meetingSession = useLiveKitMeeting({
    meetingCode: params.meetingCode,
    orgSlug: params.orgSlug,
    channelSlug: params.channelSlug,
    meetingSlug: params.meetingSlug,
  }, {
    enabled: Boolean(joinPreferences),
    initialMicEnabled: joinPreferences?.micEnabled ?? true,
    initialCameraEnabled: joinPreferences?.cameraEnabled ?? true,
  });

  const isHost =
    meetingSession.participantRole === 'host' ||
    meetingSession.participantRole === 'admin';

  const transcript = useLiveTranscription({
    meetingId: meetingSession.meeting?.id,
    enabled: Boolean(meetingSession.meeting?.id && meetingSession.micEnabled),
  });

  if (!joinPreferences) {
    return (
      <MeetingPermissionPrompt
        meetingTitle={
          params.meetingSlug ??
          params.meetingCode ??
          'Meeting'
        }
        onJoin={setJoinPreferences}
      />
    );
  }

  return (
    <MeetingLayout
      sidebar={
        isOrganizationMeeting ? (
          <Sidebar
            collapsed={false}
            micEnabled={meetingSession.micEnabled}
            cameraEnabled={meetingSession.cameraEnabled}
            screenShareEnabled={meetingSession.screenShareEnabled}
            transcriptOpen={transcriptOpen}
            onToggleMic={meetingSession.toggleMicrophone}
            onToggleCamera={meetingSession.toggleCamera}
            onToggleScreenShare={meetingSession.toggleScreenShare}
            onOpenChat={toggleChat}
            onOpenParticipants={toggleParticipants}
            onOpenTranscript={toggleTranscript}
            onOpenReactions={toggleReactions}
            onOpenSettings={() => undefined}
          />
        ) : null
      }
      rightPanel={
        chatOpen ? (
          <ChatPanel />
        ) : participantsOpen ? (
          <ParticipantsPanel participants={meetingSession.participants} />
        ) : transcriptOpen ? (
          <TranscriptPanel
            entries={transcript.entries}
            interimText={transcript.interimText}
            isListening={transcript.isListening}
            error={transcript.error}
            transcriptText={transcript.transcriptText}
            onClear={transcript.clearTranscript}
          />
        ) : null
      }
    >
      <div
        className="
          relative h-full
          overflow-hidden
          bg-background
          p-4
        "
      >
        <MeetingTopOverlay
          connectionState={meetingSession.connectionState}
          duration={meetingSession.meeting?.title ?? 'Meeting'}
          isHost={isHost}
          onLeave={meetingSession.leaveMeeting}
          onEnd={meetingSession.endMeeting}
        />

        {meetingSession.error ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            {meetingSession.error}
          </div>
        ) : meetingSession.participants.length ? (
          <MeetingGrid participants={meetingSession.participants} />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            Joining meeting
          </div>
        )}

        {meetingSession.mediaError && !meetingSession.error && (
          <div
            className="
              absolute left-1/2 top-20 z-20
              max-w-md -translate-x-1/2
              border border-destructive/30
              bg-background/95 px-4 py-3
              text-center text-sm
              text-destructive shadow-sm
              backdrop-blur
            "
          >
            {meetingSession.mediaError}
          </div>
        )}

        <LiveTranscriptOverlay
          entries={transcript.entries}
          interimText={transcript.interimText}
          isListening={transcript.isListening}
          error={transcript.error}
          onOpenTranscript={toggleTranscript}
        />

        <MeetingBottomOverlay
          micEnabled={meetingSession.micEnabled}
          cameraEnabled={meetingSession.cameraEnabled}
          screenShareEnabled={meetingSession.screenShareEnabled}
          transcriptOpen={transcriptOpen}
          onToggleMic={meetingSession.toggleMicrophone}
          onToggleCamera={meetingSession.toggleCamera}
          onToggleScreenShare={meetingSession.toggleScreenShare}
          onOpenChat={toggleChat}
          onOpenParticipants={toggleParticipants}
          onOpenTranscript={toggleTranscript}
          onOpenReactions={toggleReactions}
        />

        <ReactionsLayer />
      </div>
    </MeetingLayout>
  );
};
