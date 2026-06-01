import { supabaseAdmin } from "@wraith/auth/server";

export type SocialProfile = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  google_photo: string | null;
  user_photo: string | null;
  avatar_url: string | null;
};

export type FriendRecord = {
  friendship_id: string;
  user_id: string;
  name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  status: "accepted";
  friend_since: string;
};

export type ChatMessageRecord = {
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

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  accepted_at: string | null;
};

type ConversationRow = {
  id: string;
  type: "direct";
  created_by: string;
  created_at: string;
  updated_at: string;
};

const profileSelect = "id, name, username, email, google_photo, user_photo, avatar_url";

const getAvatarUrl = (profile: Pick<SocialProfile, "user_photo" | "google_photo" | "avatar_url">) => {
  return profile.user_photo || profile.google_photo || profile.avatar_url || null;
};

const getDisplayName = (profile: Pick<SocialProfile, "name" | "username" | "email">) => {
  return profile.name || profile.username || profile.email?.split("@")[0] || "User";
};

const getProfilesById = async (userIds: string[]) => {
  if (!userIds.length) {
    return new Map<string, SocialProfile>();
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(profileSelect)
    .in("id", userIds);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((profile) => [profile.id, profile as SocialProfile]));
};

export const getFriendshipStatusMap = async (userId: string, profileIds: string[]) => {
  if (!profileIds.length) {
    return new Map<string, FriendshipRow["status"]>();
  }

  const { data, error } = await supabaseAdmin
    .from("friendships")
    .select("requester_id, addressee_id, status")
    .or(`and(requester_id.eq.${userId},addressee_id.in.(${profileIds.join(",")})),and(addressee_id.eq.${userId},requester_id.in.(${profileIds.join(",")}))`);

  if (error) {
    throw error;
  }

  return new Map(
    (data ?? []).map((row) => {
      const friendId = row.requester_id === userId ? row.addressee_id : row.requester_id;
      return [friendId, row.status as FriendshipRow["status"]];
    }),
  );
};

export const searchProfiles = async (userId: string, query: string) => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(profileSelect)
    .or(`username.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%,email.ilike.%${normalizedQuery}%`)
    .neq("id", userId)
    .limit(12);

  if (error) {
    throw error;
  }

  const profileIds = (data ?? []).map((profile) => profile.id);
  const friendshipStatus = await getFriendshipStatusMap(userId, profileIds);

  return (data ?? []).map((profile) => ({
    id: profile.id,
    name: getDisplayName(profile),
    username: profile.username,
    email: profile.email,
    avatar_url: getAvatarUrl(profile),
    friendship: friendshipStatus.get(profile.id) ?? null,
  }));
};

export const listFriends = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at, accepted_at")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("accepted_at", { ascending: false });

  if (error) {
    throw error;
  }

  const friendships = (data ?? []) as FriendshipRow[];
  const friendIds = friendships.map((friendship) =>
    friendship.requester_id === userId ? friendship.addressee_id : friendship.requester_id,
  );
  const profiles = await getProfilesById(friendIds);

  return friendships.flatMap<FriendRecord>((friendship) => {
    const friendId = friendship.requester_id === userId ? friendship.addressee_id : friendship.requester_id;
    const profile = profiles.get(friendId);

    if (!profile) {
      return [];
    }

    return [
      {
        friendship_id: friendship.id,
        user_id: friendId,
        name: getDisplayName(profile),
        username: profile.username,
        email: profile.email,
        avatar_url: getAvatarUrl(profile),
        status: "accepted",
        friend_since: friendship.accepted_at || friendship.created_at,
      },
    ];
  });
};

export const listFriendRequests = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at, accepted_at")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const requests = (data ?? []) as FriendshipRow[];
  const profileIds = requests.map((request) =>
    request.requester_id === userId ? request.addressee_id : request.requester_id,
  );
  const profiles = await getProfilesById(profileIds);

  return {
    incoming: requests
      .filter((request) => request.addressee_id === userId)
      .flatMap((request) => {
        const profile = profiles.get(request.requester_id);
        return profile
          ? [
              {
                id: request.id,
                created_at: request.created_at,
                user: {
                  id: profile.id,
                  name: getDisplayName(profile),
                  username: profile.username,
                  email: profile.email,
                  avatar_url: getAvatarUrl(profile),
                },
              },
            ]
          : [];
      }),
    outgoing: requests
      .filter((request) => request.requester_id === userId)
      .flatMap((request) => {
        const profile = profiles.get(request.addressee_id);
        return profile
          ? [
              {
                id: request.id,
                created_at: request.created_at,
                user: {
                  id: profile.id,
                  name: getDisplayName(profile),
                  username: profile.username,
                  email: profile.email,
                  avatar_url: getAvatarUrl(profile),
                },
              },
            ]
          : [];
      }),
  };
};

export const createFriendRequest = async (requesterId: string, addresseeId: string) => {
  if (requesterId === addresseeId) {
    throw new Error("You cannot add yourself as a friend");
  }

  const orderedUserOne = requesterId < addresseeId ? requesterId : addresseeId;
  const orderedUserTwo = requesterId < addresseeId ? addresseeId : requesterId;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("friendships")
    .select("id, status")
    .eq("user_one_id", orderedUserOne)
    .eq("user_two_id", orderedUserTwo)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabaseAdmin
    .from("friendships")
    .insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      user_one_id: orderedUserOne,
      user_two_id: orderedUserTwo,
      status: "pending",
    })
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const assertFriendship = async (userId: string, friendId: string) => {
  const orderedUserOne = userId < friendId ? userId : friendId;
  const orderedUserTwo = userId < friendId ? friendId : userId;

  const { data, error } = await supabaseAdmin
    .from("friendships")
    .select("id")
    .eq("user_one_id", orderedUserOne)
    .eq("user_two_id", orderedUserTwo)
    .eq("status", "accepted")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Friendship not found");
  }
};

export const ensureDirectConversation = async (userId: string, friendId: string, createdBy: string) => {
  await assertFriendship(userId, friendId);

  const orderedUserOne = userId < friendId ? userId : friendId;
  const orderedUserTwo = userId < friendId ? friendId : userId;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("chat_conversations")
    .select("id, type, created_by, created_at, updated_at")
    .eq("type", "direct")
    .eq("user_one_id", orderedUserOne)
    .eq("user_two_id", orderedUserTwo)
    .maybeSingle<ConversationRow>();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing;
  }

  const { data: conversation, error } = await supabaseAdmin
    .from("chat_conversations")
    .insert({
      type: "direct",
      created_by: createdBy,
      user_one_id: orderedUserOne,
      user_two_id: orderedUserTwo,
    })
    .select("id, type, created_by, created_at, updated_at")
    .single<ConversationRow>();

  if (error || !conversation) {
    throw error ?? new Error("Failed to create conversation");
  }

  const { error: memberError } = await supabaseAdmin.from("chat_conversation_members").insert([
    {
      conversation_id: conversation.id,
      user_id: userId,
    },
    {
      conversation_id: conversation.id,
      user_id: friendId,
    },
  ]);

  if (memberError) {
    throw memberError;
  }

  return conversation;
};

export const acceptFriendRequest = async (userId: string, friendshipId: string) => {
  const { data, error } = await supabaseAdmin
    .from("friendships")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", friendshipId)
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .select("id, requester_id, addressee_id")
    .single();

  if (error) {
    throw error;
  }

  await ensureDirectConversation(data.requester_id, data.addressee_id, userId);

  return data;
};

export const declineFriendRequest = async (userId: string, friendshipId: string) => {
  const { error } = await supabaseAdmin
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("addressee_id", userId)
    .eq("status", "pending");

  if (error) {
    throw error;
  }
};

export const assertConversationMember = async (userId: string, conversationId: string) => {
  const { data, error } = await supabaseAdmin
    .from("chat_conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Conversation not found");
  }
};

export const hydrateMessages = async (messages: ChatMessageRecord[]) => {
  const senderIds = Array.from(new Set(messages.map((message) => message.sender_id)));
  const profiles = await getProfilesById(senderIds);

  return messages.map((message) => {
    const profile = profiles.get(message.sender_id);

    return {
      ...message,
      sender: profile
        ? {
            id: profile.id,
            name: getDisplayName(profile),
            username: profile.username,
            avatar_url: getAvatarUrl(profile),
          }
        : undefined,
    };
  });
};

export const listConversationMessages = async (userId: string, conversationId: string) => {
  await assertConversationMember(userId, conversationId);

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    throw error;
  }

  return hydrateMessages((data ?? []) as ChatMessageRecord[]);
};

export const createConversationMessage = async (userId: string, conversationId: string, body: string) => {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error("Message is required");
  }

  await assertConversationMember(userId, conversationId);

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: trimmedBody,
    })
    .select("id, conversation_id, sender_id, body, created_at")
    .single<ChatMessageRecord>();

  if (error || !data) {
    throw error ?? new Error("Failed to send message");
  }

  await supabaseAdmin
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const [message] = await hydrateMessages([data]);

  return message;
};
