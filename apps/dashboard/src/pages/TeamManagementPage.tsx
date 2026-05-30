import { Plus } from 'lucide-react';
import { useTeamMembers, useDeleteMember } from '../hooks/useTeamMembers';
import { useUIStore } from '../store/uiStore';
import { UserTable } from '../components/UserTable';
import { PageTransition } from '../components/PageTransition';

export const TeamManagementPage = () => {
  const { data: members, isLoading } = useTeamMembers();
  const deleteMember = useDeleteMember();
  const {
    adminSelectedIds,
    accountSelectedIds,
    toggleAdminSelection,
    toggleAdminSelectAll,
    clearAdminSelection,
    toggleAccountSelection,
    toggleAccountSelectAll,
    clearAccountSelection,
    openAddDialog,
    setEditMember,
  } = useUIStore();

  const adminUsers = (members || []).filter((m) => m.role === 'admin');
  const accountUsers = (members || []).filter((m) => m.role === 'account');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await deleteMember.mutateAsync(id);
      clearAdminSelection();
      clearAccountSelection();
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex-1 flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team members</h1>
            <p className="text-muted-foreground mt-1">Manage roles, access, and security</p>
          </div>
          <button
            onClick={openAddDialog}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition hover:scale-105"
          >
            <Plus size={18} /> Add member
          </button>
        </div>

        <UserTable
          title="Admin users"
          members={adminUsers}
          selectedIds={adminSelectedIds}
          onToggleSelect={toggleAdminSelection}
          onToggleSelectAll={toggleAdminSelectAll}
          onEdit={setEditMember}
          onDelete={handleDelete}
          emptyMessage="No admin members — add one to manage org settings"
        />

        <UserTable
          title="Account users"
          members={accountUsers}
          selectedIds={accountSelectedIds}
          onToggleSelect={toggleAccountSelection}
          onToggleSelectAll={toggleAccountSelectAll}
          onEdit={setEditMember}
          onDelete={handleDelete}
          emptyMessage="No account users — invite collaborators"
        />
      </div>
    </PageTransition>
  );
};
