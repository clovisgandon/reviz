import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DEFAULT_SETTINGS, setSetting, useSetting } from '@/lib/settings';
import { testKey } from '@/lib/anthropic';
import { useThemeMode, type ThemeMode } from '@/lib/theme';
import { isStandalone } from '@/lib/platform';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { fmtDate } from '@/lib/format';

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

/** Erreurs signalées dans les questions (stockées localement). */
function ReportsList() {
  const reports = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().toArray(), []);
  if (!reports?.length) return null;
  return (
    <section aria-labelledby="rep-h">
      <h2 id="rep-h" className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-muted">
        Erreurs signalées ({reports.length})
      </h2>
      <ul className="card divide-y divide-line">
        {reports.map((r) => (
          <li key={r.id} className="flex items-start gap-2 px-4 py-2 text-sm">
            <span className="flex-1">
              <code className="text-xs text-muted">{r.questionId}</code>
              <span className="block">{r.message}</span>
              <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span>
            </span>
            <button type="button" className="h-11 px-2 text-muted" aria-label="Supprimer ce signalement" onClick={() => db.reports.delete(r.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Clé API Anthropic (optionnelle) : stockée sur l'appareil seulement, masquée, testable sans frais. */
function ApiKeySection() {
  const key = useSetting('apiKey');
  const model = useSetting('apiModel');
  const [draft, setDraft] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('');
  const [modelDraft, setModelDraft] = useState<string | null>(null);
  const value = draft ?? key;

  const save = async () => {
    await setSetting('apiKey', value.trim());
    setDraft(null);
    setStatus(value.trim() ? 'Clé enregistrée sur cet appareil.' : 'Clé effacée.');
  };
  const test = async () => {
    setStatus('Test en cours…');
    try {
      await testKey(value.trim(), model);
      setStatus('✅ La clé fonctionne avec ce modèle.');
    } catch (e) {
      setStatus(`❌ ${(e as Error).message}`);
    }
  };

  return (
    <section className="card space-y-3 p-4" aria-labelledby="api-h">
      <h2 id="api-h" className="font-semibold">Génération IA (optionnel)</h2>
      <p className="text-xs text-muted">
        Ta clé API Anthropic (console.anthropic.com) permet de générer des QCM depuis tes documents. Elle reste sur cet appareil et n’est envoyée qu’à api.anthropic.com. Chaque génération est facturée sur ton compte Anthropic.
      </p>
      <div className="flex gap-2">
        <input
          type={show ? 'text' : 'password'}
          className="field flex-1 font-mono text-sm"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-ant-…"
          aria-label="Clé API Anthropic"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="button" className="btn-ghost w-20 shrink-0 px-0 text-sm" onClick={() => setShow((s) => !s)} aria-pressed={show}>
          {show ? 'Masquer' : 'Voir'}
        </button>
      </div>
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm">Modèle</span>
        <input
          className="field w-48 font-mono text-sm"
          value={modelDraft ?? model}
          onChange={(e) => setModelDraft(e.target.value)}
          onBlur={() => {
            if (modelDraft !== null) void setSetting('apiModel', modelDraft.trim() || DEFAULT_SETTINGS.apiModel);
            setModelDraft(null);
          }}
          aria-label="Modèle"
        />
      </label>
      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1" disabled={!value.trim()} onClick={test}>Tester la clé</button>
        <button type="button" className="btn-primary flex-1" disabled={draft === null} onClick={save}>Enregistrer</button>
      </div>
      {status && <p role="status" className="text-sm">{status}</p>}
    </section>
  );
}

export function SettingsPage() {
  const examDate = useSetting('examDate');
  const scoring = useSetting('scoring');
  const tolerance = useSetting('numericTolerancePct');
  const duration = useSetting('examDurationMin');
  const withBA = useSetting('examIncludeConcrete');
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
            <Row label="Durée du partiel blanc (min)" htmlFor="dur">
              <input
                id="dur"
                type="number"
                inputMode="numeric"
                min={10}
                step="5"
                className="field tabular w-24 text-right"
                value={duration}
                onChange={(e) => setSetting('examDurationMin', Math.max(10, Number(e.target.value) || 90))}
              />
            </Row>
            <Row label="Partiel blanc avec béton armé" htmlFor="ba">
              <input id="ba" type="checkbox" className="h-6 w-6 accent-[rgb(var(--c-steel))]" checked={withBA} onChange={(e) => setSetting('examIncludeConcrete', e.target.checked)} />
            </Row>
          </div>
        </section>

        <ApiKeySection />

        <ReportsList />

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
