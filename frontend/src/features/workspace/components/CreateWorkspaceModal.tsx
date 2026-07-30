import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal, Input, Button } from '@components/ui';
import { useWorkspaceStore } from '@store/workspaceStore';
import { createWorkspaceSchema, CreateWorkspaceFormData } from '../workspaceSchemas';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace, isLoading } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      await createWorkspace(data);
      reset();
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Workspace"
      description="Create a new workspace to collaborate with your team."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme Corp"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Description (optional)"
          placeholder="What is this workspace for?"
          {...register('description')}
          error={errors.description?.message}
        />
        
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
