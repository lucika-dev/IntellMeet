create table if not exists public.friendships (
  id uuid not null default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  user_one_id uuid not null references auth.users(id) on delete cascade,
  user_two_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  accepted_at timestamp with time zone null,
  constraint friendships_pkey primary key (id),
  constraint friendships_distinct_users_check check (requester_id <> addressee_id),
  constraint friendships_ordered_users_check check (user_one_id < user_two_id),
  constraint friendships_status_check check (status in ('pending', 'accepted', 'blocked'))
) tablespace pg_default;

create unique index if not exists friendships_user_pair_key
  on public.friendships (user_one_id, user_two_id);

create index if not exists friendships_requester_id_idx
  on public.friendships using btree (requester_id) tablespace pg_default;

create index if not exists friendships_addressee_id_idx
  on public.friendships using btree (addressee_id) tablespace pg_default;

create index if not exists friendships_status_idx
  on public.friendships using btree (status) tablespace pg_default;

create table if not exists public.chat_conversations (
  id uuid not null default gen_random_uuid(),
  type text not null default 'direct',
  user_one_id uuid null references auth.users(id) on delete cascade,
  user_two_id uuid null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint chat_conversations_pkey primary key (id),
  constraint chat_conversations_type_check check (type in ('direct')),
  constraint chat_conversations_direct_distinct_users_check check (user_one_id is null or user_two_id is null or user_one_id <> user_two_id)
) tablespace pg_default;

create unique index if not exists chat_conversations_direct_pair_key
  on public.chat_conversations (user_one_id, user_two_id)
  where type = 'direct';

create index if not exists chat_conversations_updated_at_idx
  on public.chat_conversations using btree (updated_at desc) tablespace pg_default;

create table if not exists public.chat_conversation_members (
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamp with time zone not null default now(),
  last_read_at timestamp with time zone null,
  constraint chat_conversation_members_pkey primary key (conversation_id, user_id)
) tablespace pg_default;

create index if not exists chat_conversation_members_user_id_idx
  on public.chat_conversation_members using btree (user_id) tablespace pg_default;

create table if not exists public.chat_messages (
  id uuid not null default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone not null default now(),
  constraint chat_messages_pkey primary key (id),
  constraint chat_messages_body_check check (char_length(trim(body)) > 0)
) tablespace pg_default;

create index if not exists chat_messages_conversation_created_at_idx
  on public.chat_messages using btree (conversation_id, created_at) tablespace pg_default;

create index if not exists chat_messages_sender_id_idx
  on public.chat_messages using btree (sender_id) tablespace pg_default;
