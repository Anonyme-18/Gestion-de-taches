'use client';

import React, { useEffect, useState } from 'react';

interface ApiStatusBannerProps {
  error: string | null;
  onRetry?: () => void;
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({ error, onRetry }) => {
  if (!error) return null;

  const isNetworkError =
    error.includes('Impossible de joindre') || error.includes('service de données');

  return (
    <div
      className={`mb-6 p-4 border-l-4 rounded-r-lg shadow-sm ${
        isNetworkError ? 'bg-amber-50 border-amber-500' : 'bg-rose-50 border-rose-500'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 ${isNetworkError ? 'text-amber-500' : 'text-rose-500'}`}>
            {isNetworkError ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </span>
          <div>
            {isNetworkError ? (
              <>
                <h4 className="text-sm font-semibold text-amber-800">
                  Réveil du serveur en cours...
                </h4>
                <p className="text-sm text-amber-700 mt-0.5">
                  Le serveur backend (plan gratuit Render) est en veille. Il peut prendre{' '}
                  <strong>30 à 50 secondes</strong> à démarrer. Cliquez sur{' '}
                  <strong>Réessayer</strong> dans quelques instants.
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-rose-800">
                  Erreur de communication avec le serveur
                </h4>
                <p className="text-sm text-rose-700 mt-0.5">{error}</p>
              </>
            )}
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className={`ml-4 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
              isNetworkError
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
            }`}
          >
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

// Composant de réveil proactif du serveur Render (affiché au chargement de la page)
const RENDER_URL = 'https://taskflow-backend-k9wq.onrender.com';

type WakeState = 'waking' | 'awake' | 'failed';

export const RenderWakeup: React.FC = () => {
  // Initialiser directement à 'waking' pour éviter setState synchrone dans l'effect
  const [awake, setAwake] = useState<WakeState>('waking');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    fetch(`${RENDER_URL}/api/health`, { signal: controller.signal })
      .then((r) => {
        clearTimeout(timeout);
        setAwake(r.ok ? 'awake' : 'failed');
      })
      .catch(() => {
        clearTimeout(timeout);
        setAwake('failed');
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (awake === 'awake') return null;

  if (awake === 'waking') {
    return (
      <div className="mb-4 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-3 text-sm text-sky-700">
        <svg
          className="animate-spin w-4 h-4 text-sky-500 flex-shrink-0"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Réveil du serveur Render en cours... (peut prendre 30 à 50s)</span>
      </div>
    );
  }

  return (
    <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
      ⚠️ Le serveur backend semble inaccessible. Veuillez réessayer dans quelques secondes.
    </div>
  );
};
