import { useEffect, useRef } from 'react';
import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

const VIEW_REGISTERED_KEY = 'view_registered';
const VIEWER_SESSION_KEY = 'viewer_session_id';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

/**
 * Hook to register a single page view per tab/session with retry logic.
 * Waits for actor readiness and retries with bounded backoff within ~15s.
 */
export function useViewTracking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const attemptCount = useRef(0);
  const maxAttempts = 5;
  const retryTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Check if view already registered in this session
    const viewRegistered = sessionStorage.getItem(VIEW_REGISTERED_KEY);
    if (viewRegistered === 'true') {
      return;
    }

    // Attempt to register view with retry logic
    const registerView = async () => {
      if (!actor) {
        // Actor not ready, schedule retry with exponential backoff
        attemptCount.current += 1;
        if (attemptCount.current <= maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attemptCount.current - 1), 5000);
          const timeout = setTimeout(registerView, delay);
          retryTimeouts.current.push(timeout);
        }
        return;
      }

      try {
        // Actor is ready, increment views
        await actor.incrementSiteViews();
        sessionStorage.setItem(VIEW_REGISTERED_KEY, 'true');
        
        // Invalidate and refetch metrics
        queryClient.invalidateQueries({ queryKey: ['siteMetrics'] });
      } catch (error) {
        console.error('Failed to register view:', error);
        // Retry on error
        attemptCount.current += 1;
        if (attemptCount.current <= maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attemptCount.current - 1), 5000);
          const timeout = setTimeout(registerView, delay);
          retryTimeouts.current.push(timeout);
        }
      }
    };

    // Start registration attempt
    registerView();

    // Cleanup timeouts on unmount
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current = [];
    };
  }, [actor, queryClient]);
}

/**
 * Hook to manage live viewer session with session-based tracking.
 * Registers once per tab/session, sends heartbeats while visible, and disconnects on unload.
 */
export function useLiveViewerSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const sessionRegistered = useRef(false);
  const retryTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptCount = useRef(0);
  const maxAttempts = 5;
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem(VIEWER_SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(VIEWER_SESSION_KEY, sessionId);
    }
    sessionIdRef.current = sessionId;

    // Register live viewer session once
    const registerSession = async () => {
      if (!actor || sessionRegistered.current) {
        if (!actor && !sessionRegistered.current) {
          // Actor not ready, schedule retry
          attemptCount.current += 1;
          if (attemptCount.current <= maxAttempts) {
            const delay = Math.min(1000 * Math.pow(2, attemptCount.current - 1), 5000);
            const timeout = setTimeout(registerSession, delay);
            retryTimeouts.current.push(timeout);
          }
        }
        return;
      }

      try {
        await actor.registerLiveViewer(sessionId);
        sessionRegistered.current = true;
        queryClient.invalidateQueries({ queryKey: ['siteMetrics'] });
        
        // Start heartbeat interval only when page is visible
        startHeartbeat();
      } catch (error) {
        console.error('Failed to register live viewer:', error);
        // Retry on error
        attemptCount.current += 1;
        if (attemptCount.current <= maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attemptCount.current - 1), 5000);
          const timeout = setTimeout(registerSession, delay);
          retryTimeouts.current.push(timeout);
        }
      }
    };

    // Start heartbeat interval
    const startHeartbeat = () => {
      if (heartbeatInterval.current) return;
      
      heartbeatInterval.current = setInterval(async () => {
        if (actor && sessionRegistered.current && document.visibilityState === 'visible' && sessionIdRef.current) {
          try {
            await actor.heartbeatLiveViewer(sessionIdRef.current);
            // Optionally refresh metrics periodically
            queryClient.invalidateQueries({ queryKey: ['siteMetrics'] });
          } catch (error) {
            console.error('Failed to send heartbeat:', error);
          }
        }
      }, HEARTBEAT_INTERVAL);
    };

    // Stop heartbeat interval
    const stopHeartbeat = () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    };

    // Disconnect handler for cleanup
    const handleDisconnect = async () => {
      if (actor && sessionRegistered.current && sessionIdRef.current) {
        try {
          await actor.unregisterLiveViewer(sessionIdRef.current);
          queryClient.invalidateQueries({ queryKey: ['siteMetrics'] });
        } catch (error) {
          // Silently fail on disconnect - best effort
          console.error('Failed to disconnect viewer:', error);
        }
      }
    };

    // Register cleanup handlers
    const handlePageHide = () => {
      stopHeartbeat();
      handleDisconnect();
    };

    const handleBeforeUnload = () => {
      stopHeartbeat();
      handleDisconnect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopHeartbeat();
        if (actor && sessionRegistered.current && sessionIdRef.current) {
          handleDisconnect();
        }
      } else if (document.visibilityState === 'visible' && sessionRegistered.current) {
        startHeartbeat();
      }
    };

    registerSession();

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current = [];
      stopHeartbeat();
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      handleDisconnect();
    };
  }, [actor, queryClient]);
}
