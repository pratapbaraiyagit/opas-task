import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { workspaceApi } from '@api/workspace.api';
import { useWorkspaceStore } from '@store/workspaceStore';

export const JoinWorkspacePage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { fetchWorkspaces } = useWorkspaceStore();
  const [error, setError] = useState<string | null>(null);
  const attemptRef = useRef(false);

  useEffect(() => {
    const join = async () => {
      if (!inviteCode || attemptRef.current) return;
      attemptRef.current = true;

      try {
        await workspaceApi.joinWorkspace(inviteCode);
        toast.success('Successfully joined the workspace!');
        await fetchWorkspaces();
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to join workspace. Link may be invalid or expired.');
      }
    };

    join();
  }, [inviteCode, navigate, fetchWorkspaces]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Oops!</h2>
        <p className="text-surface-500 mb-6">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary-600 hover:underline font-medium"
        >
          Go back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
      <h2 className="text-xl font-medium text-surface-900 dark:text-white">Joining workspace...</h2>
    </div>
  );
};
