import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { X, Bold, Italic, List, ListOrdered } from 'lucide-react';
import { cn } from '@utils/index';
import { getSocket } from '../../../api/socket';

interface MeetingNotesProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingNotes: React.FC<MeetingNotesProps> = ({ boardId, isOpen, onClose }) => {
  const [ydocState, setYdocState] = useState<{ ydoc: Y.Doc } | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    setYdocState({ ydoc: doc });
    
    const socket = getSocket();
    if (!socket) return;
    
    // Listen for local changes and send them to the server
    const handleUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== 'remote') {
        socket.emit('yjs:update', { boardId, update: Array.from(update) });
      }
    };
    
    // Listen for remote changes from the server
    const handleRemoteUpdate = (updateArray: number[]) => {
      Y.applyUpdate(doc, new Uint8Array(updateArray), 'remote');
    };
    
    doc.on('update', handleUpdate);
    socket.on('yjs:update', handleRemoteUpdate);
    
    return () => {
      doc.off('update', handleUpdate);
      socket.off('yjs:update', handleRemoteUpdate);
      doc.destroy();
    };
  }, [boardId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // History is handled by Yjs
      }),
      ...(ydocState ? [
        Collaboration.configure({
          document: ydocState.ydoc,
        }),
      ] : []),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[500px]',
      },
    },
  }, [ydocState]); // Recreate editor when ydocState is ready

  return (
    <div
      className={cn(
        'absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-2xl transition-transform duration-300 z-50 flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800">
        <h2 className="font-semibold text-surface-900 dark:text-white">Meeting Notes</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg text-surface-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {editor && (
        <div className="flex items-center gap-1 p-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn('p-1.5 rounded text-surface-700 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-800', editor.isActive('bold') && 'bg-surface-200 dark:bg-surface-800')}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn('p-1.5 rounded text-surface-700 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-800', editor.isActive('italic') && 'bg-surface-200 dark:bg-surface-800')}
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-surface-300 dark:bg-surface-700 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn('p-1.5 rounded text-surface-700 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-800', editor.isActive('bulletList') && 'bg-surface-200 dark:bg-surface-800')}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn('p-1.5 rounded text-surface-700 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-800', editor.isActive('orderedList') && 'bg-surface-200 dark:bg-surface-800')}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <div className="flex-1" />
          {ydocState && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Sync
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 cursor-text bg-white dark:bg-surface-900" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
