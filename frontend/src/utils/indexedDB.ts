import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CanvasShape } from '../types/canvas';

interface OpasDB extends DBSchema {
  'board-shapes': {
    key: string;
    value: {
      boardId: string;
      shapes: CanvasShape[];
      updatedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<OpasDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<OpasDB>('opas-board-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('board-shapes')) {
          db.createObjectStore('board-shapes', { keyPath: 'boardId' });
        }
      },
    });
  }
  return dbPromise;
};

export const saveBoardShapes = async (boardId: string, shapes: CanvasShape[]): Promise<void> => {
  try {
    const db = await initDB();
    await db.put('board-shapes', {
      boardId,
      shapes,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save shapes to IndexedDB', err);
  }
};

export const getBoardShapes = async (boardId: string): Promise<CanvasShape[] | null> => {
  try {
    const db = await initDB();
    const data = await db.get('board-shapes', boardId);
    return data ? data.shapes : null;
  } catch (err) {
    console.error('Failed to get shapes from IndexedDB', err);
    return null;
  }
};
