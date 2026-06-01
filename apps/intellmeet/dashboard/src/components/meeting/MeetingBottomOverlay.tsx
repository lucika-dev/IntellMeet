import { MeetingControls } from './MeetingControls';

interface MeetingBottomOverlayProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onOpenChat: () => void;
  onOpenParticipants: () => void;
  onOpenReactions: () => void;
  onToggleScreenShare: () => void;
}

export const MeetingBottomOverlay = ({
  micEnabled,
  cameraEnabled,
  onToggleMic,
  onToggleCamera,
  onOpenChat,
  onOpenParticipants,
  onOpenReactions,
  onToggleScreenShare,
}: MeetingBottomOverlayProps) => {
  return (
    <div
      className="
        absolute inset-x-0 bottom-0
        z-20 flex justify-center
        p-6
      "
    >
      <div
        className="
          border border-border
          bg-background/90
          p-2
          backdrop-blur
        "
      >
        <MeetingControls
          micEnabled={micEnabled}
          cameraEnabled={
            cameraEnabled
          }
          onToggleMic={
            onToggleMic
          }
          onToggleCamera={
            onToggleCamera
          }
          onOpenChat={
            onOpenChat
          }
          onOpenParticipants={
            onOpenParticipants
          }
          onOpenReactions={
            onOpenReactions
          }
          onToggleScreenShare={onToggleScreenShare}
        />
      </div>
    </div>
  );
};
