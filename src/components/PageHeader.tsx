import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './Icons';

/** En-tête de page avec grand titre iOS, bouton retour optionnel, et marge pour l'encoche. */
export function PageHeader({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-bg/90 pt-safe-t backdrop-blur-md">
      <div className="mx-auto flex max-w-xl items-end gap-2 px-4 pb-2 pt-3">
        {back && (
          <button
            type="button"
            onClick={() => nav(-1)}
            aria-label="Retour"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-steel"
          >
            <ChevronLeftIcon className="h-7 w-7" />
          </button>
        )}
        <h1 className="flex-1 truncate text-[28px] font-bold leading-tight">{title}</h1>
        {right}
      </div>
    </header>
  );
}
