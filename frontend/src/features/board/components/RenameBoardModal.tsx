import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal, Input, Button } from '@components/ui';
import { useBoardStore } from '@store/boardStore';
import { Board } from '../../../types';

const schema = z.object({
  title: z.string().min(1, 'Board title is required').max(100, 'Title is too long'),
});

type RenameBoardForm = z.infer<typeof schema>;

interface RenameBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
}

export const RenameBoardModal: React.FC<RenameBoardModalProps> = ({
  isOpen,
  onClose,
  board,
}) => {
  const { updateBoard, isLoading } = useBoardStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenameBoardForm>({
    resolver: zodResolver(schema),
    defaultValues: { title: board.title },
  });

  // Reset form when modal opens with current title
  React.useEffect(() => {
    if (isOpen) {
      reset({ title: board.title });
    }
  }, [isOpen, board.title, reset]);

  const onSubmit = async (data: RenameBoardForm) => {
    try {
      await updateBoard(board.id, { title: data.title });
      onClose();
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Board">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Board Title"
          {...register('title')}
          error={errors.title?.message}
          placeholder="e.g. Q3 Roadmap"
          autoFocus
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Rename
          </Button>
        </div>
      </form>
    </Modal>
  );
};
