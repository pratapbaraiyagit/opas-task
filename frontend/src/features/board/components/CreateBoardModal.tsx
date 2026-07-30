import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Modal, Input, Button } from '@components/ui';
import { useBoardStore } from '@store/boardStore';
import { useWorkspaceStore } from '@store/workspaceStore';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
});

type FormData = z.infer<typeof schema>;

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose }) => {
  const { createBoard, isLoading } = useBoardStore();
  const { activeWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!activeWorkspace) return;
    try {
      const newBoard = await createBoard(activeWorkspace.id, data);
      reset();
      onClose();
      navigate(`/board/${newBoard.id}`);
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create new board"
      description="Create a new board in this workspace to start collaborating."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <Input
          label="Board title"
          placeholder="e.g. Brainstorming Session"
          {...register('title')}
          error={errors.title?.message}
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-800 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Board
          </Button>
        </div>
      </form>
    </Modal>
  );
};
