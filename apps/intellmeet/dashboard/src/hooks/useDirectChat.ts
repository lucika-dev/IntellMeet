import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';

import {
  getSocketAuthToken,
  socialApi,
  type DirectMessage,
} from '../api/socialApi';
import { useAuthStore } from '../store/authStore';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:5000/api';

const SOCKET_URL = API_URL.replace(/\/api$/, '');

export const useDirectConversation = (friendId: string | null) => {
  return useQuery({
    queryKey: ['directConversation', friendId],
    enabled: !!friendId,
    queryFn: async () => {
      if (!friendId) {
        throw new Error('Missing friend');
      }

      const { conversation } =
        await socialApi.getDirectConversation(friendId);

      return conversation;
    },
  });
};

export const useDirectMessages = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['directMessages', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) {
        return [];
      }

      const { messages } =
        await socialApi.fetchMessages(conversationId);

      return messages;
    },
  });
};

export const useDirectChatSocket = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;
    let currentSocket: Socket | null = null;

    const connect = async () => {
      if (!conversationId || !userId) {
        return;
      }

      const token = await getSocketAuthToken();

      if (!active) {
        return;
      }

      currentSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        withCredentials: true,
        auth: {
          token,
        },
      });

      currentSocket.on('connect', () => {
        setConnected(true);
        currentSocket?.emit('chat:conversation:join', {
          conversationId,
        });
      });

      currentSocket.on('disconnect', () => {
        setConnected(false);
      });

      currentSocket.on('chat:message:new', (message: DirectMessage) => {
        if (message.conversation_id !== conversationId) {
          return;
        }

        queryClient.setQueryData<DirectMessage[]>(
          ['directMessages', conversationId],
          (current = []) => {
            if (current.some((entry) => entry.id === message.id)) {
              return current;
            }

            return [...current, message];
          },
        );
      });

      setSocket(currentSocket);
    };

    connect();

    return () => {
      active = false;
      setConnected(false);
      setSocket(null);
      currentSocket?.disconnect();
    };
  }, [conversationId, queryClient, userId]);

  const sendMessage = useMemo(
    () => (body: string) => {
      if (!socket || !conversationId) {
        return;
      }

      socket.emit('chat:message:send', {
        conversationId,
        body,
      });
    },
    [conversationId, socket],
  );

  return {
    connected,
    sendMessage,
  };
};
