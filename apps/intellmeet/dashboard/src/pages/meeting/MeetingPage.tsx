import { useMemo } from 'react';

import { useLocation, useParams } from 'react-router-dom';

import { Sidebar } from '../../components/Sidebar';

import { ChatPanel } from '../../components/meeting/ChatPanel';
import { MeetingBottomOverlay } from '../../components/meeting/MeetingBottomOverlay';
import { ParticipantsPanel } from '../../components/meeting/ParticipantsPanel';
import { ReactionsLayer } from '../../components/meeting/ReactionsLayer';

import { useLiveKitMeeting } from '../../hooks/useLiveKitMeeting';
import { useMeetingStore } from '../../store/meetingStore';

import { MeetingGrid } from './MeetingGrid';
import { MeetingLayout } from './MeetingLayout';
import { MeetingTopOverlay } from './MeetingTopOverlay';

export const MeetingPage = () => {
  const location = useLocation();
  const params = useParams();

  const {
    chatOpen,
    participantsOpen,
    toggleChat,
    toggleParticipants,
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
  });

  const isHost =
    meetingSession.participantRole === 'host' ||
    meetingSession.participantRole === 'admin';

  return (
    <MeetingLayout
      sidebar={
        isOrganizationMeeting ? (
          <Sidebar
            collapsed={false}
            micEnabled={meetingSession.micEnabled}
            cameraEnabled={meetingSession.cameraEnabled}
            onToggleMic={meetingSession.toggleMicrophone}
            onToggleCamera={meetingSession.toggleCamera}
            onToggleScreenShare={meetingSession.toggleScreenShare}
            onOpenChat={toggleChat}
            onOpenParticipants={toggleParticipants}
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

        {!isOrganizationMeeting && (
          <MeetingBottomOverlay
            micEnabled={meetingSession.micEnabled}
            cameraEnabled={meetingSession.cameraEnabled}
            onToggleMic={meetingSession.toggleMicrophone}
            onToggleCamera={meetingSession.toggleCamera}
            onToggleScreenShare={meetingSession.toggleScreenShare}
            onOpenChat={toggleChat}
            onOpenParticipants={toggleParticipants}
            onOpenReactions={toggleReactions}
          />
        )}

        <ReactionsLayer />
      </div>
    </MeetingLayout>
  );
};
