import { useMemo, useState } from 'react';
import {
  Check,
  MessageSquare,
  Search,
  SendHorizontal,
  UserPlus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@wraith/ui/shadcn/button';
import { Input } from '@wraith/ui/shadcn/input';

import type { Friend, FriendRequest, SearchUser } from '../api/socialApi';
import {
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useFriendRequests,
  useFriends,
  useSendFriendRequest,
  useUserSearch,
} from '../hooks/useFriends';
import {
  useDirectChatSocket,
  useDirectConversation,
  useDirectMessages,
} from '../hooks/useDirectChat';
import { useAuthStore } from '../store/authStore';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Avatar = ({
  name,
  src,
}: {
  name: string;
  src?: string | null;
}) => {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-sm font-semibold text-foreground">
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

const FriendRow = ({
  friend,
  selected,
  onSelect,
}: {
  friend: Friend;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${
        selected
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/60'
      }`}
    >
      <Avatar
        name={friend.name}
        src={friend.avatar_url}
      />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {friend.name}
        </span>

        <span className="block truncate text-xs text-muted-foreground">
          {friend.username ? `@${friend.username}` : friend.email}
        </span>
      </span>

      <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
};

const RequestRow = ({
  request,
  onAccept,
  onDecline,
  busy,
}: {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
  busy: boolean;
}) => {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <Avatar
        name={request.user.name}
        src={request.user.avatar_url}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {request.user.name}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {request.user.username ? `@${request.user.username}` : request.user.email}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={busy}
          onClick={onAccept}
          className="size-9"
        >
          <Check className="size-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={busy}
          onClick={onDecline}
          className="size-9"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
};

const SearchRow = ({
  user,
  onAdd,
  busy,
}: {
  user: SearchUser;
  onAdd: () => void;
  busy: boolean;
}) => {
  const disabled =
    busy ||
    user.friendship === 'accepted' ||
    user.friendship === 'pending';

  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <Avatar
        name={user.name}
        src={user.avatar_url}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {user.name}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {user.username ? `@${user.username}` : user.email}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        variant={user.friendship ? 'outline' : 'default'}
        disabled={disabled}
        onClick={onAdd}
        className="shrink-0 gap-2"
      >
        <UserPlus className="size-4" />
        {user.friendship === 'accepted'
          ? 'Friend'
          : user.friendship === 'pending'
            ? 'Pending'
            : 'Add'}
      </Button>
    </div>
  );
};

export const FriendsPage = () => {
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const searchQueryResult = useUserSearch(searchQuery);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();

  const friends = friendsQuery.data ?? [];
  const selectedFriend =
    friends.find((friend) => friend.user_id === selectedFriendId) ??
    friends[0] ??
    null;

  const conversationQuery = useDirectConversation(
    selectedFriend?.user_id ?? null,
  );
  const messagesQuery = useDirectMessages(
    conversationQuery.data?.id ?? null,
  );
  const chatSocket = useDirectChatSocket(
    conversationQuery.data?.id ?? null,
  );

  const incomingRequests = requestsQuery.data?.incoming ?? [];
  const outgoingRequests = requestsQuery.data?.outgoing ?? [];
  const searchResults = searchQueryResult.data ?? [];

  const sortedMessages = useMemo(
    () =>
      [...(messagesQuery.data ?? [])].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      ),
    [messagesQuery.data],
  );

  const handleSendMessage = () => {
    const body = messageBody.trim();

    if (!body) {
      return;
    }

    chatSocket.sendMessage(body);
    setMessageBody('');
  };

  const handleSendFriendRequest = (userId: string) => {
    sendRequest.mutate(userId, {
      onSuccess: () => toast.success('Friend request sent'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptRequest.mutate(requestId, {
      onSuccess: () => toast.success('Friend request accepted'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleDeclineRequest = (requestId: string) => {
    declineRequest.mutate(requestId, {
      onSuccess: () => toast.success('Friend request declined'),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Friends
          </h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`size-2 rounded-full ${chatSocket.connected ? 'bg-primary' : 'bg-muted-foreground'}`} />
          {chatSocket.connected ? 'Chat connected' : 'Chat idle'}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        <section className="flex min-h-0 flex-col overflow-hidden border border-border bg-card">
          <div className="shrink-0 border-b border-border p-4">
            <h2 className="text-base font-semibold">
              Your friends
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {friends.length} connected people
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {friendsQuery.isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Loading friends
              </div>
            ) : friends.length ? (
              friends.map((friend) => (
                <FriendRow
                  key={friend.user_id}
                  friend={friend}
                  selected={selectedFriend?.user_id === friend.user_id}
                  onSelect={() => setSelectedFriendId(friend.user_id)}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                Accepted friends will appear here.
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden border border-border bg-card">
          {selectedFriend ? (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-border p-4">
                <Avatar
                  name={selectedFriend.name}
                  src={selectedFriend.avatar_url}
                />

                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">
                    {selectedFriend.name}
                  </h2>

                  <p className="truncate text-sm text-muted-foreground">
                    {selectedFriend.username
                      ? `@${selectedFriend.username}`
                      : selectedFriend.email}
                  </p>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {messagesQuery.isLoading || conversationQuery.isLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading conversation
                  </div>
                ) : sortedMessages.length ? (
                  <div className="flex flex-col gap-3">
                    {sortedMessages.map((message) => {
                      const mine = message.sender_id === currentUserId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[72%] rounded-md px-4 py-3 ${
                            mine
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                          >
                            <p className="break-words text-sm leading-6">
                              {message.body}
                            </p>

                            <p className={`mt-2 text-[11px] ${
                              mine
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                    No messages yet.
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-border p-4">
                <form
                  className="flex items-center gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSendMessage();
                  }}
                >
                  <Input
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder="Message your friend"
                    className="h-11"
                  />

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!chatSocket.connected || !messageBody.trim()}
                    className="h-11 w-11 shrink-0"
                  >
                    <SendHorizontal className="size-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Select a friend to start chatting.
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-col gap-5 overflow-hidden">
          <div className="shrink-0 border border-border bg-card p-4">
            <h2 className="text-base font-semibold">
              Add friends
            </h2>

            <div className="mt-4 flex items-center gap-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search username, name, or email"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto border border-border bg-card p-4">
            <h2 className="text-base font-semibold">
              Requests
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              {incomingRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  busy={acceptRequest.isPending || declineRequest.isPending}
                  onAccept={() => handleAcceptRequest(request.id)}
                  onDecline={() => handleDeclineRequest(request.id)}
                />
              ))}

              {!incomingRequests.length && (
                <p className="text-sm text-muted-foreground">
                  No incoming requests.
                </p>
              )}
            </div>

            {!!outgoingRequests.length && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Sent
                </h3>

                <div className="mt-3 flex flex-col gap-3">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-3 rounded-md border border-border p-3"
                    >
                      <Avatar
                        name={request.user.name}
                        src={request.user.avatar_url}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {request.user.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          Pending
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Search results
              </h3>

              <div className="mt-3 flex flex-col gap-3">
                {searchResults.map((user) => (
                  <SearchRow
                    key={user.id}
                    user={user}
                    busy={sendRequest.isPending}
                    onAdd={() => handleSendFriendRequest(user.id)}
                  />
                ))}

                {searchQuery.trim().length >= 2 &&
                  !searchQueryResult.isLoading &&
                  !searchResults.length && (
                    <p className="text-sm text-muted-foreground">
                      No users found.
                    </p>
                  )}

                {searchQuery.trim().length < 2 && (
                  <p className="text-sm text-muted-foreground">
                    Type at least two characters.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
