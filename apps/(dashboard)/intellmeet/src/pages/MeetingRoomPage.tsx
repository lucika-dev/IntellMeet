import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { CircleDot, Copy, Mic, MicOff, Monitor, PhoneOff, Video, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { meetingsApi, type MeetingRecord } from '../api/meetingsApi';
import { PageTransition } from '../components/PageTransition';

type PeerState = {
  peerId: string;
  stream: MediaStream;
};

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:5000/api';

const SOCKET_URL = API_URL.replace(/\/api$/, '');

const StreamView = ({ stream, muted = false }: { stream: MediaStream; muted?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full w-full object-cover" />;
};

const createPeerConnection = (stream: MediaStream, socket: Socket, meetingCode: string, peerId: string) => {
  const connection = new RTCPeerConnection({
    iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
  });

  stream.getTracks().forEach((track) => connection.addTrack(track, stream));

  connection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('meeting:ice-candidate', {
        meetingCode,
        targetId: peerId,
        candidate: event.candidate,
      });
    }
  };

  return connection;
};

export const MeetingRoomPage = () => {
  const { meetingCode = '' } = useParams();
  const [meeting, setMeeting] = useState<MeetingRecord | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<PeerState[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const { data } = useQuery({
    queryKey: ['meeting', meetingCode],
    queryFn: () => meetingsApi.fetchMeetingByCode(meetingCode),
    enabled: Boolean(meetingCode),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (data) {
      setMeeting(data);
    }
  }, [data]);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;

    const initializeRoom = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const socket = io(SOCKET_URL, {
          transports: ['websocket'],
          withCredentials: true,
        });

        socketRef.current = socket;

        socket.emit('meeting:join', {
          meetingCode,
        });

        socket.on('meeting:peer-joined', async ({ peerId }: { peerId: string }) => {
          if (!stream) return;

          const connection = createPeerConnection(stream, socket, meetingCode, peerId);

          connection.ontrack = (event) => {
            const remoteStream = event.streams[0];

            setRemotePeers((current) => {
              const next = current.filter((entry) => entry.peerId !== peerId);
              next.push({ peerId, stream: remoteStream });
              return [...next];
            });
          };

          peerConnections.current.set(peerId, connection);

          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);

          socket.emit('meeting:offer', {
            meetingCode,
            targetId: peerId,
            offer,
          });
        });

        socket.on('meeting:offer', async ({ fromId, offer }: { fromId: string; offer: RTCSessionDescriptionInit }) => {
          if (!stream) return;

          const connection = createPeerConnection(stream, socket, meetingCode, fromId);

          connection.ontrack = (event) => {
            const remoteStream = event.streams[0];

            setRemotePeers((current) => {
              const next = current.filter((entry) => entry.peerId !== fromId);
              next.push({ peerId: fromId, stream: remoteStream });
              return [...next];
            });
          };

          peerConnections.current.set(fromId, connection);

          await connection.setRemoteDescription(offer);
          const answer = await connection.createAnswer();
          await connection.setLocalDescription(answer);

          socket.emit('meeting:answer', {
            meetingCode,
            targetId: fromId,
            answer,
          });
        });

        socket.on('meeting:answer', async ({ fromId, answer }: { fromId: string; answer: RTCSessionDescriptionInit }) => {
          const connection = peerConnections.current.get(fromId);

          if (connection) {
            await connection.setRemoteDescription(answer);
          }
        });

        socket.on('meeting:ice-candidate', async ({ fromId, candidate }: { fromId: string; candidate: RTCIceCandidateInit }) => {
          const connection = peerConnections.current.get(fromId);

          if (connection && candidate) {
            await connection.addIceCandidate(candidate);
          }
        });

        socket.on('meeting:peer-left', ({ peerId }: { peerId: string }) => {
          const connection = peerConnections.current.get(peerId);

          if (connection) {
            connection.close();
            peerConnections.current.delete(peerId);
          }

          setRemotePeers((current) => current.filter((entry) => entry.peerId !== peerId));
        });
      } catch {
        toast.error('Camera and microphone access is required to join the room');
      }
    };

    initializeRoom();

    return () => {
      active = false;

      socketRef.current?.disconnect();
      peerConnections.current.forEach((connection) => connection.close());
      peerConnections.current.clear();

      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [meetingCode]);

  useEffect(() => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !isVideoOff;
    });
  }, [isMuted, isVideoOff, localStream]);

  const shareUrl = useMemo(() => meeting?.meeting_url || window.location.href, [meeting]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Meeting link copied');
  };

  return (
    <PageTransition>
      <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
        <div className="glass-card flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Meeting room
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {meeting?.title || 'Connecting...'}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <CircleDot size={14} className="animate-pulse text-emerald-500" />
              {meetingCode || 'Waiting for code'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={copyLink} className="inline-flex items-center gap-2 border border-border/50 bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:bg-accent/30">
              <Copy size={14} />
              Copy link
            </button>

            <button className="inline-flex items-center gap-2 border border-border/50 bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:bg-accent/30">
              <Monitor size={14} />
              Screen share
            </button>

            <button className="inline-flex items-center gap-2 border border-transparent bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black">
              <PhoneOff size={14} />
              Leave
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[1.5fr_0.9fr]">
          <section className="glass-card min-h-0 overflow-hidden p-5">
            <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="overflow-hidden border border-border/50 bg-background/40">
                {localStream ? (
                  <StreamView stream={localStream} muted />
                ) : (
                  <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
                    Requesting camera access...
                  </div>
                )}
              </div>

              <div className="grid min-h-[280px] gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {remotePeers.length > 0 ? (
                  remotePeers.map((peer) => (
                    <div key={peer.peerId} className="overflow-hidden border border-border/50 bg-background/40">
                      <StreamView stream={peer.stream} />
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center border border-dashed border-border/50 bg-background/40 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1 xl:col-span-2">
                    Waiting for another participant to join.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="glass-card min-h-0 overflow-hidden p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Room controls</h2>
                <p className="text-sm text-muted-foreground">Native WebRTC session state.</p>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => setIsMuted((current) => !current)} className="flex w-full items-center justify-between border border-border/50 bg-background/40 px-4 py-3 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:bg-accent/30">
                <span className="inline-flex items-center gap-2">
                  {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                  Microphone
                </span>
                <span className="text-xs text-muted-foreground">{isMuted ? 'Muted' : 'Live'}</span>
              </button>

              <button onClick={() => setIsVideoOff((current) => !current)} className="flex w-full items-center justify-between border border-border/50 bg-background/40 px-4 py-3 text-sm font-medium text-foreground backdrop-blur-xl transition-colors hover:bg-accent/30">
                <span className="inline-flex items-center gap-2">
                  {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
                  Camera
                </span>
                <span className="text-xs text-muted-foreground">{isVideoOff ? 'Off' : 'On'}</span>
              </button>
            </div>

            <div className="mt-5 border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground">
              <p className="text-foreground">Meeting details</p>
              <p className="mt-2">{meeting?.organization_name || 'Workspace'}</p>
              <p className="mt-1">{meeting?.meeting_code || 'Pending code'}</p>
              <p className="mt-1">{meeting?.participant_count || 0} participants</p>
            </div>
          </aside>
        </div>
      </div>
    </PageTransition>
  );
};