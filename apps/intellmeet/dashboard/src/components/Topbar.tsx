import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { Button } from '@wraith/ui/shadcn/button';
import { Input } from '@wraith/ui/shadcn/input';

import { Logo } from './Logo';
import { OrganizationSelector } from './OrganizationSelector';
import { CreateMeetingDialog } from './CreateMeetingDialog';
import { CreateInstantMeetingButton } from './CreateInstantMeetingButton';

import { useAuthStore } from '../store/authStore';
import { useOrganizations } from '../hooks/useOrganizations';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface TopbarProps {
  collapsed: boolean;

  setCollapsed: (
    value: boolean,
  ) => void;
}

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme =
    localStorage.getItem(
      'theme',
    );

  if (
    storedTheme === 'dark' ||
    storedTheme === 'light'
  ) {
    return storedTheme;
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
    ? 'dark'
    : 'light';
};

export const Topbar = ({
  collapsed,
  setCollapsed,
}: TopbarProps) => {
  const { user } =
    useAuthStore();

  const [theme, setTheme] =
    useState<
      'light' | 'dark'
    >(getInitialTheme);

  const {
    data: organizations = [],
    isLoading,
  } = useOrganizations();

  const selectedOrganizationId =
    useWorkspaceStore(
      (state) =>
        state.selectedOrganizationId,
    );

  const activeOrganization =
    organizations.find(
      (organization) =>
        organization.id ===
        selectedOrganizationId,
    ) ??
    organizations[0] ??
    null;

  const canCreateOrgMeetings =
    !!activeOrganization &&
    (
      activeOrganization.role ===
        'owner' ||
      activeOrganization.role ===
        'admin' ||
      activeOrganization.owner_id ===
        user?.id
    );

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      theme ===
        'dark',
    );
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme =
      theme === 'dark'
        ? 'light'
        : 'dark';

    setTheme(nextTheme);

    localStorage.setItem(
      'theme',
      nextTheme,
    );

    document.documentElement.classList.toggle(
      'dark',
      nextTheme ===
        'dark',
    );
  };

  return (
    <header
      className="
        fixed inset-x-0 top-0 z-50
        h-20 shrink-0
        border-b border-border
        bg-background/95
        backdrop-blur
      "
    >
      <div
        className="
          flex h-full items-center
          gap-4 px-6
        "
      >
        <div
          className="
            flex shrink-0 items-center
            gap-4
          "
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() =>
              setCollapsed(
                !collapsed,
              )
            }
            className="
              h-11 w-11 shrink-0
            "
          >
            <Menu className="size-4" />
          </Button>

          <Logo
            src="/Logo.svg"
            alt="IntellMeet"
            size={145}
            className="
              h-auto w-auto shrink-0
            "
          />
        </div>

        <div
          className="
            flex min-w-0 flex-1
            justify-center
            px-2 lg:px-6
          "
        >
          <div
            className="
              relative w-full
              max-w-4xl
            "
          >
            <Search
              className="
                pointer-events-none
                absolute left-4 top-1/2
                size-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              type="search"
              placeholder="Search meetings, classrooms, members..."
              className="
                h-11 pl-11 pr-4
                shadow-sm
              "
            />
          </div>
        </div>

        <div
          className="
            flex shrink-0 items-center
            gap-3
          "
        >
          <CreateInstantMeetingButton />

          {canCreateOrgMeetings && (
            <CreateMeetingDialog />
          )}

          {!isLoading &&
            organizations.length >
              0 && (
              <div className="min-w-[220px]">
                <OrganizationSelector />
              </div>
            )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={
              toggleTheme
            }
            className="
              h-11 w-11 shrink-0
            "
          >
            {theme ===
            'dark' ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="
              relative h-11 w-11
              shrink-0
            "
          >
            <Bell className="size-4" />

            <span
              className="
                absolute right-2 top-2
                size-2 rounded-full
                bg-primary
              "
            />
          </Button>
        </div>
      </div>
    </header>
  );
};
