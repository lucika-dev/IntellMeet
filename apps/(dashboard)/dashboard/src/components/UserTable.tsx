import { Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TeamMember } from '../types';

interface UserTableProps {
  title: string;
  members: TeamMember[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[], checked: boolean) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export const UserTable = ({
  title,
  members,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  emptyMessage,
}: UserTableProps) => {
  const allSelected = members.length > 0 && members.every((m) => selectedIds.has(m.id));
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          {title} ({members.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50 text-xs font-medium text-muted-foreground">
            <tr>
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(members.map((m) => m.id), e.target.checked)}
                  className="rounded border-border bg-card"
                />
              </th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-muted/30 transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.id)}
                    onChange={() => onToggleSelect(member.id)}
                    className="rounded border-border bg-card"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                      {member.avatarInitials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{member.name}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2.5 py-0.5 text-xs rounded-full ${
                      member.role === 'admin'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {member.role === 'admin' ? 'Admin' : 'Account'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true })}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(member)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(member.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  {emptyMessage || 'No members'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
