import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { Dropdown } from '@components/ui';
import { useWorkspaceStore } from '@store/workspaceStore';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const dropdownItems = workspaces.map((workspace) => ({
    label: workspace.name,
    icon: activeWorkspace?.id === workspace.id ? <Check className="w-4 h-4 text-primary-500" /> : <div className="w-4 h-4" />,
    onClick: () => setActiveWorkspace(workspace),
  }));

  dropdownItems.push('divider' as any);
  dropdownItems.push({
    label: 'Create Workspace',
    icon: <Plus className="w-4 h-4" />,
    onClick: () => setIsCreateModalOpen(true),
  } as any);

  if (!activeWorkspace && workspaces.length === 0) {
    return (
      <>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Create Workspace
        </button>
        <CreateWorkspaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Dropdown
        trigger={
          <div className="flex items-center gap-2 cursor-pointer group w-full">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">
                {activeWorkspace?.name.charAt(0).toUpperCase() || 'W'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate block">
                {activeWorkspace?.name || 'Select Workspace'}
              </span>
            </div>
          </div>
        }
        items={dropdownItems}
      />
      
      <CreateWorkspaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
};
