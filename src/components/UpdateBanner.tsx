import { useRegisterSW } from 'virtual:pwa-register/react';

/** Bannière « Nouvelle version dispo » quand le service worker a une mise à jour en attente. */
export function UpdateBanner({ hidden = false }: { hidden?: boolean }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // Vérifie les mises à jour toutes les heures quand l'appli reste ouverte.
      if (reg) setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
    },
  });

  if (hidden || (!needRefresh && !offlineReady)) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-ink p-3 text-bg shadow-lg"
    >
      <p className="flex-1 text-sm">
        {needRefresh ? 'Nouvelle version disponible.' : 'Prêt pour une utilisation hors ligne ✓'}
      </p>
      {needRefresh ? (
        <button type="button" className="btn-accent" onClick={() => updateServiceWorker(true)}>
          Recharger
        </button>
      ) : (
        <button type="button" className="btn bg-bg/20" onClick={() => setOfflineReady(false)}>
          OK
        </button>
      )}
      {needRefresh && (
        <button type="button" className="btn bg-bg/20" onClick={() => setNeedRefresh(false)} aria-label="Plus tard">
          ✕
        </button>
      )}
    </div>
  );
}
