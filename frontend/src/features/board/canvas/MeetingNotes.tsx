import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import { Socket } from 'socket.io-client';
import { X, Bold, Italic, List, ListOrdered, Download, Sparkles } from 'lucide-react';
import { cn } from '@utils/index';
import { getSocket } from '../../../api/socket';
import { generateActionItems } from '../../../api/ai.api';
import toast from 'react-hot-toast';

interface MeetingNotesProps {
  boardId: string;
  isOpen: boolean;
  readOnly?: boolean;
  onClose: () => void;
}

type YjsUpdatePayload = { boardId: string; update: number[] } | number[];
type YjsSyncPayload = { boardId: string; state: number[] } | number[];

const getUpdateFromPayload = (payload: YjsUpdatePayload): number[] =>
  Array.isArray(payload) ? payload : payload.update;

const getSyncStateFromPayload = (payload: YjsSyncPayload): number[] =>
  Array.isArray(payload) ? payload : payload.state;

const getBoardIdFromUpdatePayload = (payload: YjsUpdatePayload, fallback: string): string =>
  Array.isArray(payload) ? fallback : payload.boardId;

const getBoardIdFromSyncPayload = (payload: YjsSyncPayload, fallback: string): string =>
  Array.isArray(payload) ? fallback : payload.boardId;

export const MeetingNotes: React.FC<MeetingNotesProps> = ({ boardId, isOpen, readOnly = false, onClose }) => {
  const [ydocState, setYdocState] = useState<{ ydoc: Y.Doc } | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    const doc = new Y.Doc();
    setYdocState({ ydoc: doc });

    let attachedSocket: Socket | null = null;

    const handleUpdate = (update: Uint8Array, origin: unknown) => {
      if (readOnly || !attachedSocket) return;
      if (origin !== 'remote') {
        attachedSocket.emit('yjs:update', { boardId, update: Array.from(update) });
      }
    };

    const handleRemoteUpdate = (payload: YjsUpdatePayload) => {
      if (getBoardIdFromUpdatePayload(payload, boardId) !== boardId) return;
      Y.applyUpdate(doc, new Uint8Array(getUpdateFromPayload(payload)), 'remote');
    };

    const handleSync = (payload: YjsSyncPayload) => {
      if (getBoardIdFromSyncPayload(payload, boardId) !== boardId) return;
      const state = getSyncStateFromPayload(payload);
      if (!state.length) return;
      Y.applyUpdate(doc, new Uint8Array(state), 'remote');
    };

    const attachToSocket = (socket: Socket) => {
      if (attachedSocket && attachedSocket !== socket) {
        attachedSocket.off('yjs:update', handleRemoteUpdate);
        attachedSocket.off('yjs:sync', handleSync);
        doc.off('update', handleUpdate);
      }

      if (attachedSocket !== socket) {
        attachedSocket = socket;
        doc.on('update', handleUpdate);
        socket.on('yjs:update', handleRemoteUpdate);
        socket.on('yjs:sync', handleSync);
      }

      socket.emit('notes:request_sync', boardId);
    };

    const tryAttach = () => {
      const socket = getSocket();
      if (socket?.connected) {
        attachToSocket(socket);
        return true;
      }
      return false;
    };

    const pollId = window.setInterval(() => {
      if (!attachedSocket) {
        tryAttach();
      }
    }, 200);

    const existingSocket = getSocket();
    const onConnect = () => tryAttach();
    existingSocket?.on('connect', onConnect);
    tryAttach();

    return () => {
      window.clearInterval(pollId);
      existingSocket?.off('connect', onConnect);
      if (attachedSocket) {
        attachedSocket.off('yjs:update', handleRemoteUpdate);
        attachedSocket.off('yjs:sync', handleSync);
      }
      doc.off('update', handleUpdate);
      doc.destroy();
    };
  }, [boardId, readOnly]);

  useEffect(() => {
    if (!isOpen) return;
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('notes:request_sync', boardId);
    }
  }, [isOpen, boardId]);

  const editor = useEditor({
    editable: !readOnly,
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
  }, [ydocState, readOnly]);

  const exportToPDF = () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    
    // Create a temporary hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Build print-friendly HTML
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Meeting Notes - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              color: #1a1a1a;
              padding: 40px;
              line-height: 1.6;
            }
            h1, h2, h3 { color: #111; margin-top: 1.5em; margin-bottom: 0.5em; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 0.25em; }
            p { margin-bottom: 1em; }
            @page { margin: 20mm; }
          </style>
        </head>
        <body>
          <h2>Meeting Notes</h2>
          <hr style="border: 0; border-top: 1px solid #ccc; margin-bottom: 2em;" />
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    // Focus and print, then cleanup
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    }, 250);
  };

  const handleGenerateActionItems = async () => {
    if (!editor) return;
    try {
      setIsGeneratingAI(true);
      const content = editor.getText();
      const res = await generateActionItems(content);
      
      const { actionItems } = res;
      if (actionItems && actionItems.length > 0) {
        let htmlList = '<h3>AI Action Items ✨</h3><ul>';
        actionItems.forEach((item: string) => {
          htmlList += `<li>${item}</li>`;
        });
        htmlList += '</ul><p></p>';
        
        editor.chain().focus().insertContentAt(editor.state.doc.content.size, htmlList).run();
        toast.success('Action items generated');
      } else {
        toast('No action items found');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate action items');
    } finally {
      setIsGeneratingAI(false);
    }
  };

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

      {editor && !readOnly && (
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
          
          <button
            onClick={handleGenerateActionItems}
            disabled={isGeneratingAI}
            title="Generate AI Action Items"
            className={cn(
              "flex items-center gap-1 p-1.5 rounded text-xs font-medium mr-1 transition-colors",
              isGeneratingAI 
                ? "bg-surface-200 text-surface-500 cursor-not-allowed dark:bg-surface-800 dark:text-surface-600" 
                : "bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-400 dark:hover:bg-primary-900/60"
            )}
          >
            <Sparkles className={cn("w-3.5 h-3.5", isGeneratingAI && "animate-pulse")} />
            AI
          </button>

          <button
            onClick={exportToPDF}
            title="Export as PDF"
            className="p-1.5 rounded text-surface-700 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-800"
          >
            <Download className="w-4 h-4" />
          </button>

          {ydocState && (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full ml-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Sync
            </div>
          )}
        </div>
      )}

      {editor && readOnly && (
        <div className="px-4 py-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-b border-surface-200 dark:border-surface-800">
          View only — meeting notes cannot be edited.
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-4 bg-white dark:bg-surface-900 ${readOnly ? 'cursor-default' : 'cursor-text'}`} onClick={() => !readOnly && editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
