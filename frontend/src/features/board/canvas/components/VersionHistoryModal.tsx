import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Spinner } from '@components/ui';
import { History, Clock, Save, RefreshCw } from 'lucide-react';
import { boardApi } from '../../../../api/board.api';
import { useCanvasStore } from '../../../../store/canvasStore';
import { getSocket } from '../../../../api/socket';
import { format } from 'date-fns';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, boardId }) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const shapes = useCanvasStore((state) => state.shapes);
  const receiveRestoredShapes = useCanvasStore((state) => state.receiveRestoredShapes);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, boardId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const data = await boardApi.getVersions(boardId);
      setVersions(data);
    } catch (err) {
      console.error('Failed to fetch versions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!versionName.trim()) return;
    setIsSaving(true);
    try {
      const newVersion = await boardApi.saveVersion(boardId, versionName, shapes);
      setVersions([newVersion, ...versions]);
      setVersionName('');
    } catch (err) {
      console.error('Failed to save version', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will overwrite the current canvas for everyone.')) return;
    try {
      const restored = await boardApi.restoreVersion(boardId, versionId);
      // Update local state
      receiveRestoredShapes(restored.shapes);
      // Emit to other clients via socket
      const socket = getSocket();
      if (socket) {
        socket.emit('board:restored', { boardId, shapes: restored.shapes });
      }
      onClose();
    } catch (err) {
      console.error('Failed to restore version', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History" size="lg">
      <div className="space-y-6">
        <div className="flex items-end gap-3 p-4 bg-surface-50 dark:bg-surface-900 rounded-lg">
          <div className="flex-1">
            <Input
              label="Save Current State"
              placeholder="e.g. Initial Draft, Before Review"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>
          <Button 
            onClick={handleSave} 
            isLoading={isSaving} 
            disabled={!versionName.trim()}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Snapshot
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
            <History className="w-4 h-4" /> Past Versions
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : versions.length === 0 ? (
            <p className="text-surface-500 text-center p-8 bg-surface-50 dark:bg-surface-900 rounded-lg">
              No saved versions yet.
            </p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <div>
                    <h4 className="font-medium text-surface-900 dark:text-white">{v.versionName}</h4>
                    <div className="flex items-center gap-3 text-xs text-surface-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(v.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span>•</span>
                      <span>by {v.createdBy?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{v.shapes?.length || 0} items</span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    leftIcon={<RefreshCw className="w-3 h-3" />}
                    onClick={() => handleRestore(v.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
