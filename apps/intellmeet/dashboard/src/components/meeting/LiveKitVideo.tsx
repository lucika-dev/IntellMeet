import { useEffect, useRef } from 'react';
import type {
  LocalVideoTrack,
  RemoteVideoTrack,
} from 'livekit-client';

export const LiveKitVideo = ({
  track,
  muted,
}: {
  track?: LocalVideoTrack | RemoteVideoTrack;
  muted?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;

    if (!element || !track) {
      return;
    }

    track.attach(element);

    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="h-full w-full object-cover"
    />
  );
};
