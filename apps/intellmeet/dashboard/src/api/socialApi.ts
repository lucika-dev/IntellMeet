import { supabase } from '@wraith/auth/client';

export type Friend = {
  friendship_id: string;
  user_id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  status: 'accepted';
  friend_since: string;
};

export type FriendRequest = {
  id: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  };
};

export type SearchUser = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  friendship: 'pending' | 'accepted' | 'blocked' | null;
};

export type DirectConversation = {
  id: string;
  type: 'direct';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
  };
};

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:5000/api';

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Missing session');
  }

  return session.access_token;
};

const request = async <T>(path: string, init?: RequestInit) => {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload.data as T;
};

export const getSocketAuthToken = getAccessToken;

export const socialApi = {
  fetchFriends: () => request<{ friends: Friend[] }>('/social/friends'),

  fetchFriendRequests: () =>
    request<{
      incoming: FriendRequest[];
      outgoing: FriendRequest[];
    }>('/social/friend-requests'),

  searchUsers: (query: string) =>
    request<{ users: SearchUser[] }>(
      `/social/users/search?q=${encodeURIComponent(query)}`,
    ),

  sendFriendRequest: (addresseeId: string) =>
    request<{ friendship: { id: string; status: string } }>(
      '/social/friend-requests',
      {
        method: 'POST',
        body: JSON.stringify({ addresseeId }),
      },
    ),

  acceptFriendRequest: (requestId: string) =>
    request<{ friendship: { id: string } }>(
      `/social/friend-requests/${requestId}/accept`,
      {
        method: 'POST',
      },
    ),

  declineFriendRequest: (requestId: string) =>
    request<{ ok: boolean }>(
      `/social/friend-requests/${requestId}`,
      {
        method: 'DELETE',
      },
    ),

  getDirectConversation: (friendId: string) =>
    request<{ conversation: DirectConversation }>(
      '/social/direct-conversations',
      {
        method: 'POST',
        body: JSON.stringify({ friendId }),
      },
    ),

  fetchMessages: (conversationId: string) =>
    request<{ messages: DirectMessage[] }>(
      `/social/conversations/${conversationId}/messages`,
    ),
};
