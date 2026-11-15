import { useState } from 'react';
import { isIos, isStandalone } from '@/lib/platform';
import { CloseIcon, PlusSquareIcon, ShareIcon } from './Icons';

const KEY = 'reviz.installBannerHiddenUntil';

function hidden(): boolean {
  try {
    return Number(localStorage.getItem(KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

/** Bannière « Installe l'appli » : seulement dans Safari iOS, hors mode plein écran. */
export function InstallBanner() {
  const [show, setShow] = useState(() => isIos() && !isStandalone() && !hidden());
  if (!show) return null;

  const close = () => {
    try {
      localStorage.setItem(KEY, String(Date.now() + 7 * 24 * 3600 * 1000));
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <aside role="region" aria-label="Installer l'appli" className="card mx-4 mt-3 p-4">
      <div className="flex items-start gap-3">
        <img src={`${import.meta.env.BASE_URL}apple-touch-icon-180.png`} alt="" className="h-12 w-12 rounded-xl" />
        <div className="flex-1">
          <p className="font-semibold">Installe RéviZ sur ton iPhone</p>
          <p className="text-sm text-muted">Plein écran, hors ligne, en un geste.</p>
        </div>
        <button type="button" onClick={close} aria-label="Fermer" className="-m-2 h-11 w-11 p-2 text-muted">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <ol className="mt-3 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-steel text-xs font-bold text-white dark:text-bg">1</span>
          Touche <ShareIcon className="h-5 w-5 text-steel" /> <b>Partager</b> en bas de Safari
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-steel text-xs font-bold text-white dark:text-bg">2</span>
          Choisis <PlusSquareIcon className="h-5 w-5 text-steel" /> <b>Sur l’écran d’accueil</b>
        </li>
        <li className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-steel text-xs font-bold text-white dark:text-bg">3</span>
          Touche <b>Ajouter</b>, puis ouvre RéviZ depuis l’icône
        </li>
      </ol>
    </aside>
  );
}
