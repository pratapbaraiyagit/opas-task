import React, { useState } from 'react';
import { X, Copy, Check, Globe } from 'lucide-react';
import { Button } from '@components/ui';
import { Board } from '../../../../types';
import api from '../../../../api/client';

interface ShareModalProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBoard: Board) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ board, isOpen, onClose, onUpdate }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const publicLink = `${window.location.origin}/b/${board.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleTogglePublic = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/boards/${board.id}/share`, {
        isPublic: !board.isPublic
      });
      onUpdate(response.data.data);
    } catch (err) {
      console.error('Failed to update share settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-surface-200 dark:border-surface-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Share Board</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl flex-shrink-0 transition-colors ${board.isPublic ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-surface-900 dark:text-white">Public Link</h3>
                <button 
                  onClick={handleTogglePublic}
                  disabled={isLoading}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${board.isPublic ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${board.isPublic ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400">
                {board.isPublic 
                  ? "Anyone with the link can view and edit this board."
                  : "Only workspace members can access this board."}
              </p>
            </div>
          </div>

          {board.isPublic && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Copy Link
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={publicLink}
                  className="flex-1 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-700 dark:text-surface-300 focus:outline-none"
                />
                <Button variant="secondary" onClick={handleCopy} className="gap-2 flex-shrink-0">
                  {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
