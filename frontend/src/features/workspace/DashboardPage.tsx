import React from 'react';
import { EmptyState, Button } from '@components/ui';
import { useWorkspaceStore } from '@store/workspaceStore';
import { Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { activeWorkspace, isFetching } = useWorkspaceStore();

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-surface-500">Loading workspace...</p>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <EmptyState
        title="No workspace selected"
        description="Select or create a workspace from the sidebar to get started."
        icon={<div className="w-12 h-12 bg-surface-100 dark:bg-surface-800 rounded-xl" />}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {activeWorkspace.name}
          </h1>
          <p className="text-surface-500 mt-1">
            {activeWorkspace.description || 'Welcome to your workspace.'}
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>
          New Board
        </Button>
      </div>

      <EmptyState
        title="No boards yet"
        description="Create your first board to start collaborating."
        actionLabel="Create Board"
        onAction={() => {
          // Placeholder for next phase
        }}
      />
    </div>
  );
};
