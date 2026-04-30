'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { authApi } from '@lib/api';
import type { AuthResult } from '@appTypes/index';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type GoogleAuthMode = 'login' | 'register';

interface GoogleAuthButtonProps {
  mode: GoogleAuthMode;
  organizationName?: string;
  organizationSlug?: string;
  disabled?: boolean;
  onAuthenticated: (result: AuthResult) => void;
}

const GOOGLE_SCRIPT_ID = 'google-identity-service';

function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });
}

export function GoogleAuthButton({
  mode,
  organizationName,
  organizationSlug,
  disabled,
  onAuthenticated,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const isDisabled = disabled || !clientId;

  const mutation = useMutation({
    mutationFn: (idToken: string) => {
      if (mode === 'register') {
        if (!organizationName || !organizationSlug) {
          throw new Error('Organization details required');
        }
        return authApi.googleRegister({
          idToken,
          organizationName,
          organizationSlug,
        });
      }

      return authApi.googleLogin({ idToken });
    },
    onSuccess: (res) => {
      onAuthenticated(res.data.data);
    },
    onError: (error: Error | AxiosError<{ message: string }>) => {
      if (error instanceof Error && error.message === 'Organization details required') {
        toast.error('Please enter organization details before continuing.');
        return;
      }

      if ('response' in error) {
        toast.error(error.response?.data?.message ?? 'Google authentication failed.');
        return;
      }

      toast.error(error.message || 'Google authentication failed.');
    },
  });

  const handleCredential = useCallback(
    (response: { credential?: string }) => {
      if (!response.credential) {
        toast.error('Google authentication failed.');
        return;
      }
      mutation.mutate(response.credential);
    },
    [mutation],
  );

  const shouldRenderButton = useMemo(() => !isDisabled, [isDisabled]);

  useEffect(() => {
    if (!shouldRenderButton || !buttonRef.current) return;

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id || !buttonRef.current) return;

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
          ux_mode: 'popup',
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: '320',
        });
      })
      .catch(() => {
        toast.error('Could not load Google authentication.');
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, handleCredential, shouldRenderButton]);

  if (isDisabled) {
    return (
      <button type="button" className="btn-secondary w-full" disabled>
        Continue with Google
      </button>
    );
  }

  return <div ref={buttonRef} className="flex w-full justify-center" />;
}
