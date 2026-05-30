import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useAddMember, useUpdateMember } from '../hooks/useTeamMembers';
import type { TeamMember } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const MemberFormDialog = () => {
  const { isAddDialogOpen, closeAddDialog, editMember } = useUIStore();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();

  const { register, handleSubmit, reset } = useForm<Omit<TeamMember, 'id'>>({
    defaultValues: {
      name: '',
      email: '',
      role: 'account',
      avatarInitials: '',
      dateAdded: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (editMember) {
      reset(editMember);
    } else {
      reset({
        name: '',
        email: '',
        role: 'account',
        avatarInitials: '',
        dateAdded: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
    }
  }, [editMember, reset]);

  const onSubmit = async (data: any) => {
    const initials = data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    const memberData = { ...data, avatarInitials: initials };

    if (editMember) {
      await updateMember.mutateAsync({ id: editMember.id, updates: memberData });
    } else {
      await addMember.mutateAsync(memberData);
    }
    closeAddDialog();
  };

  return (
    <AnimatePresence>
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeAddDialog}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md glass p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editMember ? 'Edit member' : 'Add new member'}
              </h2>
              <button onClick={closeAddDialog} className="p-1 hover:bg-accent rounded-full transition">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full name</label>
                <input
                  {...register('name', { required: true })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="alex@company.com"
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                >
                  <option value="account">Account</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeAddDialog}
                  className="px-4 py-2 text-muted-foreground hover:bg-accent rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition shadow-lg"
                >
                  {editMember ? 'Save changes' : 'Add member'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
