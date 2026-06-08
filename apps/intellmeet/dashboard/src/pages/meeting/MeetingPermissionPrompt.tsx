import {
  Mic,
  MicOff,
  Video,
  VideoOff,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@wraith/ui/shadcn/button';

type JoinPreferences = {
  micEnabled: boolean;
  cameraEnabled: boolean;
};

type MeetingPermissionPromptProps = {
  meetingTitle?: string;
  onJoin: (preferences: JoinPreferences) => void;
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
};

export const MeetingPermissionPrompt = ({
  meetingTitle = 'Meeting',
  onJoin,
}: MeetingPermissionPromptProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [prompted, setPrompted] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = previewStream;
  }, [previewStream]);

  useEffect(() => {
    return () => {
      stopStream(previewStream);
    };
  }, [previewStream]);

  const requestMedia = useCallback(
    async (nextMic = micEnabled, nextCamera = cameraEnabled) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Your browser does not support camera or microphone access.');
        setPrompted(true);
        return;
      }

      if (!nextMic && !nextCamera) {
        stopStream(previewStream);
        setPreviewStream(null);
        setPrompted(true);
        setError(null);
        return;
      }

      setRequesting(true);
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: nextMic,
          video: nextCamera,
        });

        stopStream(previewStream);
        setPreviewStream(stream);
        setMicEnabled(stream.getAudioTracks().length > 0 && nextMic);
        setCameraEnabled(stream.getVideoTracks().length > 0 && nextCamera);
        setPrompted(true);
      } catch {
        stopStream(previewStream);
        setPreviewStream(null);
        setMicEnabled(false);
        setCameraEnabled(false);
        setPrompted(true);
        setError('Camera or microphone permission was blocked. You can still join and turn devices on later.');
      } finally {
        setRequesting(false);
      }
    },
    [
      cameraEnabled,
      micEnabled,
      previewStream,
    ],
  );

  const toggleMic = async () => {
    const nextMic = !micEnabled;

    if (nextMic && !previewStream?.getAudioTracks().length) {
      await requestMedia(true, cameraEnabled);
      return;
    }

    previewStream?.getAudioTracks().forEach((track) => {
      track.enabled = nextMic;
    });
    setMicEnabled(nextMic);
  };

  const toggleCamera = async () => {
    const nextCamera = !cameraEnabled;

    if (nextCamera && !previewStream?.getVideoTracks().length) {
      await requestMedia(micEnabled, true);
      return;
    }

    previewStream?.getVideoTracks().forEach((track) => {
      track.enabled = nextCamera;
    });
    setCameraEnabled(nextCamera);
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-background p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        <div className="relative aspect-video overflow-hidden border border-border bg-muted">
          {previewStream && cameraEnabled ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-24 items-center justify-center bg-background">
                <VideoOff className="size-10 text-muted-foreground" />
              </div>

              <div>
                <div className="text-lg font-semibold">Camera preview is off</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Allow camera access to see yourself before joining.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between border border-border bg-card p-5">
          <div>
            <div className="text-sm text-muted-foreground">Ready to join</div>
            <h1 className="mt-2 text-2xl font-semibold">{meetingTitle}</h1>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={micEnabled ? 'outline' : 'destructive'}
                onClick={toggleMic}
                className="h-12 gap-2"
              >
                {micEnabled ? (
                  <Mic className="size-4" />
                ) : (
                  <MicOff className="size-4" />
                )}
                <span>{micEnabled ? 'Mic on' : 'Mic off'}</span>
              </Button>

              <Button
                type="button"
                variant={cameraEnabled ? 'outline' : 'destructive'}
                onClick={toggleCamera}
                className="h-12 gap-2"
              >
                {cameraEnabled ? (
                  <Video className="size-4" />
                ) : (
                  <VideoOff className="size-4" />
                )}
                <span>{cameraEnabled ? 'Camera on' : 'Camera off'}</span>
              </Button>
            </div>

            {error && (
              <div className="mt-4 border border-destructive/30 bg-background p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {!prompted && (
              <Button
                type="button"
                onClick={() => requestMedia(true, true)}
                disabled={requesting}
                className="h-12"
              >
                {requesting ? 'Waiting for permission' : 'Allow mic and camera'}
              </Button>
            )}

            <Button
              type="button"
              variant={prompted ? 'default' : 'outline'}
              onClick={() =>
                onJoin({
                  micEnabled,
                  cameraEnabled,
                })
              }
              className="h-12"
            >
              {prompted ? 'Join meeting' : 'Join without devices'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
