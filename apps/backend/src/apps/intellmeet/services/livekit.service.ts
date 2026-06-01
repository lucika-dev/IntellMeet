import { AccessToken } from "livekit-server-sdk";

import { env } from "@/config/env";

type LiveKitTokenOptions = {
  roomName: string;
  identity: string;
  participantName: string;
  metadata: Record<string, unknown>;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  canUpdateOwnMetadata?: boolean;
};

export const createLiveKitAccessToken = ({
  roomName,
  identity,
  participantName,
  metadata,
  canPublish = true,
  canSubscribe = true,
  canPublishData = true,
  canUpdateOwnMetadata = true,
}: LiveKitTokenOptions) => {
  const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity,
    name: participantName,
    metadata: JSON.stringify(metadata),
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe,
    canPublishData,
    canUpdateOwnMetadata,
  });

  return token.toJwt();
};
