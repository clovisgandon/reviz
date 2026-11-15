import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { setSetting, useSetting } from '@/lib/settings';
import { useThemeMode, type ThemeMode } from '@/lib/theme';
import { isStandalone } from '@/lib/platform';

function Row({ label, children, htmlFor }: { label: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-2">
      <label htmlFor={htmlFor} className="text-[15px]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const examDate = useSetting('examDate');
  const scoring = useSetting('scoring');
  const tolerance = useSetting('numericTolerancePct');
  const [theme, setTheme] = useThemeMode();
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
  }, []);

  return (
    <>
      <PageHeader title="Réglages" />
      <main className="mx-auto max-w-xl space-y-5 px-4">
        <section className="card divide-y divide-line">
          <Row label="Date du partiel" htmlFor="exam-date">
            <input
              id="exam-date"
              type="date"
              className="field w-auto"
              value={examDate}
              onChange={(e) => setSetting('examDate', e.target.value)}
            />
          </Row>
          <Row label="Thème" htmlFor="theme">
            <select id="theme" className="field w-auto" value={theme} onChange={(e) => setTheme(e.target.value as ThemeMode)}>
              <option value="auto">Automatique</option>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </Row>
        </section>

        <section aria-labelledby="bareme-h">
          <h2 id="bareme-h" className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
            Barème du partiel blanc
          </h2>
          <div className="card divide-y divide-line">
            {(
              [
                ['right', 'Bonne réponse'],
                ['wrong', 'Réponse fausse'],
                ['blank', 'Sans réponse'],
              ] as const
            ).map(([k, label]) => (
              <Row key={k} label={label} htmlFor={`sc-${k}`}>
                <input
                  id={`sc-${k}`}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  className="field tabular w-24 text-right"
                  value={scoring[k]}
                  onChange={(e) => setSetting('scoring', { ...scoring, [k]: Number(e.target.value) })}
                />
              </Row>
            ))}
            <Row label="Tolérance numérique (%)" htmlFor="tol">
              <input
                id="tol"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                className="field tabular w-24 text-right"
                value={tolerance}
                onChange={(e) => setSetting('numericTolerancePct', Number(e.target.value))}
              />
            </Row>
          </div>
        </section>

        <section className="card space-y-1 p-4 text-sm text-muted">
          <p>
            Stockage persistant :{' '}
            <b className="text-ink">{persisted === null ? 'inconnu' : persisted ? 'oui ✓' : 'non (installe l’appli)'}</b>
          </p>
          <p>
            Mode : <b className="text-ink">{isStandalone() ? 'appli installée' : 'navigateur'}</b>
          </p>
          <p>
            Version : <b className="text-ink">{__APP_VERSION__}</b>
          </p>
          <p className="pt-2">Clé API, export/import et réinitialisation : étapes 7 et 8.</p>
        </section>
      </main>
    </>
  );
}
