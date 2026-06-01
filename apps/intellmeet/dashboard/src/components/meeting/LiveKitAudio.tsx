import { useEffect, useRef } from 'react';
import type { RemoteAudioTrack } from 'livekit-client';

export const LiveKitAudio = ({
  track,
}: {
  track?: RemoteAudioTrack;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const element = audioRef.current;

    if (!element || !track) {
      return;
    }

    track.attach(element);

    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <audio
      ref={audioRef}
      autoPlay
    />
  );
};
