import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { linkedInAPI } from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

export default function LinkedInCallback() {
  const [status, setStatus] = useState<Status>('loading');
  const [step, setStep] = useState('Reading callback parameters…');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const didRun = useRef(false);

  useEffect(() => {
    // Guard against React 18 Strict Mode double-fire
    if (didRun.current) return;
    didRun.current = true;

    const handleCallback = async () => {
      // ── Step 1: OAuth-level error from LinkedIn ──────────────────────────
      const oauthError = searchParams.get('error');
      if (oauthError) {
        const desc =
          searchParams.get('error_description') ||
          'LinkedIn authorization was denied or cancelled.';
        console.error('[Callback] LinkedIn OAuth error:', oauthError, desc);
        setErrorMessage(desc);
        setStatus('error');
        return;
      }

      // ── Step 2: Extract code + state ─────────────────────────────────────
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      console.log('[Callback] code present:', !!code);
      console.log('[Callback] state:', state);

      if (!code) {
        setErrorMessage('No authorization code was returned by LinkedIn.');
        setStatus('error');
        return;
      }
      if (!state) {
        setErrorMessage('Missing state parameter — the request may have been tampered with.');
        setStatus('error');
        return;
      }

      // ── Step 3: POST /linkedin/finish ────────────────────────────────────
      setStep('Completing LinkedIn connection…');

      const savedUserId = sessionStorage.getItem('linkedin_oauth_user_id');
      console.log('[Callback] savedUserId from sessionStorage:', savedUserId);
      console.log('[Callback] Sending code length:', code.length, '| state:', state);

      try {
        const result = await linkedInAPI.finish(code, state, savedUserId ?? undefined);
        console.log('[Callback] /linkedin/finish response:', JSON.stringify(result, null, 2));

        if (result?.success) {
          sessionStorage.removeItem('linkedin_oauth_user_id');
          setStatus('success');
          toast.success(result.message || 'LinkedIn connected successfully!');
          setTimeout(() => navigate('/linkedin-vault', { replace: true }), 1500);
        } else {
          // Backend returned 2xx but success:false
          const msg =
            result?.message || result?.error || 'LinkedIn connection failed. Please try again.';
          console.error('[Callback] finish returned success:false —', result);
          setErrorMessage(msg);
          setStatus('error');
        }
      } catch (err: any) {
        // Network error, 4xx, 5xx, timeout, CORS, etc.
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'An unexpected error occurred while connecting LinkedIn.';
        console.error('[Callback] finish failed — status:', err.response?.status, '| body:', err.response?.data ?? err.message);
        setErrorMessage(msg);
        setStatus('error');
      }
    };

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-muted/30">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{step}</p>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-muted/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg className="h-7 w-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">LinkedIn Connected</h2>
        <p className="text-sm text-muted-foreground">Redirecting you now…</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-muted/30 p-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <svg className="h-7 w-7 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div className="text-center max-w-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">Connection Failed</h2>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/linkedin-vault')}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-md bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/70 transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
