import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { linkedInAPI } from '@/lib/api';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { useAuthStore } from '@/store/useAuthStore';

export interface UseLinkedInOAuthOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useLinkedInOAuth(options: UseLinkedInOAuthOptions = {}) {
  const { linkedInStatus, setLinkedInStatus, clearLinkedInStatus, isLoading, setLoading } =
    useLinkedInStore();
  const { user } = useAuthStore();

  /**
   * Step 1 — POST /linkedin/connect { userId } → redirect to LinkedIn.
   * Browser returns to /api/oauth/linkedin/callback?code=&state=
   */
  const connect = useCallback(async () => {
    if (!user?.id) {
      toast.error('You must be logged in to connect LinkedIn.');
      return;
    }
    try {
      setLoading(true);
      const response = await linkedInAPI.connect(user.id);
      if (response?.url) {
        // Persist userId so the callback page can include it after the redirect
        sessionStorage.setItem('linkedin_oauth_user_id', user.id);
        window.location.href = response.url;
        // don't reset loading — page is navigating away
      } else {
        throw new Error('Backend did not return a LinkedIn OAuth URL');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to start LinkedIn connection';
      toast.error(msg);
      options.onError?.(error instanceof Error ? error : new Error(msg));
      setLoading(false);
    }
  }, [user, setLoading, options]);

  /** DELETE /linkedin/token/:userId */
  const disconnect = useCallback(async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }
    try {
      setLoading(true);
      await linkedInAPI.disconnect(user.id);
      clearLinkedInStatus();
      toast.success('Disconnected from LinkedIn');
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, clearLinkedInStatus]);

  /**
   * GET /linkedin/token/:userId — check if the user has a stored token.
   * Maps the response into the LinkedInStatus shape used by the store.
   */
  const fetchStatus = useCallback(async () => {
    if (!user?.id) return null;
    try {
      setLoading(true);
      const response = await linkedInAPI.getToken(user.id);
      if (response?.success && response?.data) {
        const tokenData = response.data;
        const status = {
          isConnected: true,
          isExpired: tokenData.expires_at
            ? new Date(tokenData.expires_at) < new Date()
            : false,
          data: {
            vanityName: tokenData.vanity_name ?? '',
            personUrn: tokenData.person_urn ?? '',
            profile: {},
            expiresAt: tokenData.expires_at ?? '',
            connectedAt: tokenData.created_at ?? '',
          },
        };
        setLinkedInStatus(status);
        return status;
      }
      // No token found → not connected
      clearLinkedInStatus();
      return null;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status !== 404) {
        // Unexpected error — log it so we can diagnose
        console.error('[LinkedIn] fetchStatus error', status, err?.response?.data ?? err?.message);
      }
      // 404 = no token yet, anything else = treat as disconnected
      clearLinkedInStatus();
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setLinkedInStatus, clearLinkedInStatus]);

  /** Fetch status and show a toast result */
  const testConnection = useCallback(async () => {
    const result = await fetchStatus();
    if (result?.isConnected && !result?.isExpired) {
      toast.success('LinkedIn connection is active!');
      return true;
    }
    toast.error('LinkedIn is not connected or the token has expired.');
    return false;
  }, [fetchStatus]);

  const isConnected = Boolean(linkedInStatus?.isConnected && !linkedInStatus?.isExpired);

  const daysUntilExpiry = useMemo(() => {
    const expiresAt = linkedInStatus?.data?.expiresAt;
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [linkedInStatus]);

  return {
    linkedInStatus,
    isLoading,
    isConnected,
    isExpired: linkedInStatus?.isExpired ?? false,
    vanityName: linkedInStatus?.data?.vanityName,
    connectedAt: linkedInStatus?.data?.connectedAt,
    daysUntilExpiry,
    connect,
    disconnect,
    fetchStatus,
    testConnection,
  };
}

export default useLinkedInOAuth;
