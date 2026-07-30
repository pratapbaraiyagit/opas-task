import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, MoreVertical, Shield, Edit2, Link } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, Input, Modal, Avatar, Dropdown } from '@components/ui';
import { useWorkspaceStore } from '@store/workspaceStore';
import { useAuthStore } from '@store/authStore';
import { workspaceApi } from '@api/workspace.api';
import { addMemberSchema, AddMemberFormData } from './workspaceSchemas';
import { Role } from '../../types';

export const MembersPage: React.FC = () => {
  const { activeWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { user: currentUser } = useAuthStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { role: 'viewer' },
  });

  const onSubmit = async (data: AddMemberFormData) => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      await workspaceApi.addMember(activeWorkspace.id, { email: data.email, role: data.role as Role });
      toast.success('Member added successfully');
      setIsInviteModalOpen(false);
      reset();
      fetchWorkspaces();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!activeWorkspace) return;
    const link = `${window.location.origin}/join/${activeWorkspace.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeWorkspace || !confirm('Are you sure you want to remove this member?')) return;
    try {
      await workspaceApi.removeMember(activeWorkspace.id, userId);
      toast.success('Member removed');
      fetchWorkspaces();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, role: Role) => {
    if (!activeWorkspace) return;
    try {
      await workspaceApi.updateMemberRole(activeWorkspace.id, userId, role);
      toast.success('Role updated');
      fetchWorkspaces();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-surface-500">
        Please select a workspace first.
      </div>
    );
  }

  // Check if current user is owner
  const isOwner = activeWorkspace.owner === currentUser?.id || 
                  activeWorkspace.members.find((m: any) => m.user.id === currentUser?.id)?.role === 'owner';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Team Members</h1>
          <p className="text-surface-500 mt-1">
            Manage who has access to {activeWorkspace.name}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-3">
            <Button variant="secondary" leftIcon={<Link className="w-4 h-4" />} onClick={handleCopyInviteLink}>
              Copy Link
            </Button>
            <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsInviteModalOpen(true)}>
              Add Member
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
        <ul className="divide-y divide-surface-200 dark:divide-surface-800">
          {activeWorkspace.members.map((member: any) => (
            <li key={member.user.id} className="p-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors first:rounded-t-xl last:rounded-b-xl">
              <div className="flex items-center gap-4">
                <Avatar name={member.user.name} />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {member.user.name} {member.user.id === currentUser?.id && '(You)'}
                  </p>
                  <p className="text-xs text-surface-500">{member.user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                  {member.role === 'owner' && <Shield className="w-3.5 h-3.5" />}
                  {member.role === 'editor' && <Edit2 className="w-3.5 h-3.5" />}
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                
                {isOwner && member.user.id !== activeWorkspace.owner && (
                  <Dropdown
                    trigger={
                      <button className="btn-icon">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      { label: 'Make Editor', onClick: () => handleUpdateRole(member.user.id, 'editor') },
                      { label: 'Make Viewer', onClick: () => handleUpdateRole(member.user.id, 'viewer') },
                      'divider',
                      { label: 'Remove from Workspace', onClick: () => handleRemoveMember(member.user.id), danger: true },
                    ]}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Add Team Member"
        description="Invite a new member to collaborate in your workspace."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Input
            label="Email Address"
            placeholder="colleague@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">Role</label>
            <select
              {...register('role')}
              className="w-full px-4 py-2 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="viewer">Viewer (Can only view boards)</option>
              <option value="editor">Editor (Can create and edit boards)</option>
            </select>
            {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
