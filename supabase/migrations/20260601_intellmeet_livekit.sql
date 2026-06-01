alter table public.channels
  add column if not exists slug text;

update public.channels
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

alter table public.channels
  alter column slug set not null;

create unique index if not exists channels_organization_id_slug_key
  on public.channels (organization_id, slug);

alter table public.meetings
  add column if not exists meeting_slug text,
  add column if not exists room_name text,
  add column if not exists ended_at timestamptz,
  add column if not exists meeting_type text;

update public.meetings
set meeting_slug = coalesce(meeting_slug, id::text),
    room_name = coalesce(room_name, 'lk-' || coalesce(meeting_slug, id::text)),
    meeting_type = coalesce(meeting_type, case when organization_id is null then 'instant' else 'organization' end)
where meeting_slug is null
   or room_name is null
   or meeting_type is null;

alter table public.meetings
  alter column meeting_slug set not null,
  alter column room_name set not null,
  alter column meeting_type set not null;

alter table public.meetings
  alter column organization_id drop not null;

create unique index if not exists meetings_meeting_slug_key
  on public.meetings (meeting_slug);

create unique index if not exists meetings_room_name_key
  on public.meetings (room_name);

alter table public.meetings
  add constraint meetings_meeting_type_check
  check (meeting_type in ('instant', 'organization'));

create index if not exists meetings_organization_channel_slug_idx
  on public.meetings (organization_id, channel_id, meeting_slug);

create unique index if not exists meeting_participants_meeting_user_key
  on public.meeting_participants (meeting_id, user_id);
