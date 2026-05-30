import { create } from 'zustand';
import type { TeamMember } from '../types';

interface UIState {
  adminSelectedIds: Set<string>;
  accountSelectedIds: Set<string>;
  isAddDialogOpen: boolean;
  editMember: TeamMember | null;
  toggleAdminSelection: (id: string) => void;
  toggleAdminSelectAll: (ids: string[], selected: boolean) => void;
  clearAdminSelection: () => void;
  toggleAccountSelection: (id: string) => void;
  toggleAccountSelectAll: (ids: string[], selected: boolean) => void;
  clearAccountSelection: () => void;
  openAddDialog: () => void;
  closeAddDialog: () => void;
  setEditMember: (member: TeamMember | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  adminSelectedIds: new Set(),
  accountSelectedIds: new Set(),
  isAddDialogOpen: false,
  editMember: null,
  toggleAdminSelection: (id) =>
    set((state) => {
      const newSet = new Set(state.adminSelectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return { adminSelectedIds: newSet };
    }),
  toggleAdminSelectAll: (ids, selected) =>
    set(() => ({ adminSelectedIds: selected ? new Set(ids) : new Set() })),
  clearAdminSelection: () => set({ adminSelectedIds: new Set() }),
  toggleAccountSelection: (id) =>
    set((state) => {
      const newSet = new Set(state.accountSelectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return { accountSelectedIds: newSet };
    }),
  toggleAccountSelectAll: (ids, selected) =>
    set(() => ({ accountSelectedIds: selected ? new Set(ids) : new Set() })),
  clearAccountSelection: () => set({ accountSelectedIds: new Set() }),
  openAddDialog: () => set({ isAddDialogOpen: true, editMember: null }),
  closeAddDialog: () => set({ isAddDialogOpen: false, editMember: null }),
  setEditMember: (member) => set({ editMember: member, isAddDialogOpen: !!member }),
}));
