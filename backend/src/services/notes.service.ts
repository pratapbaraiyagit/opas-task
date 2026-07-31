import * as Y from 'yjs';

import { BoardRepository } from '@modules/board/board.repository';

const boardRepository = new BoardRepository();

export const applyNotesUpdate = async (
  boardId: string,
  update: number[],
): Promise<number[]> => {
  const existing = await boardRepository.getNotesState(boardId);
  const doc = new Y.Doc();

  if (existing?.length) {
    Y.applyUpdate(doc, new Uint8Array(existing));
  }

  Y.applyUpdate(doc, new Uint8Array(update));
  const merged = Y.encodeStateAsUpdate(doc);
  await boardRepository.updateNotesState(boardId, Buffer.from(merged));

  return Array.from(merged);
};

export const getNotesStateArray = async (boardId: string): Promise<number[]> => {
  const state = await boardRepository.getNotesState(boardId);
  if (!state?.length) {
    return [];
  }
  return Array.from(state);
};
