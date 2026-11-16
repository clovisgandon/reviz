import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { useSetting } from '@/lib/settings';
import { estimateCost } from '@/lib/anthropic';
import type { ImportResult } from '@/lib/importQuestions';
import { fmt } from '@/lib/format';
import { defaultOptions, GenOptionsForm } from './GenOptionsForm';
import { ReviewList } from './ReviewList';
import { estimate, generate, planGeneration } from './generate';

type Est = { input: number; output: number; requests: number; cost: number | null };

/** Génération IA avec la clé API de l'utilisateur : formulaire → estimation → génération → relecture. */
export function GeneratePage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const apiKey = useSetting('apiKey');
  const model = useSetting('apiModel');
  const data = useLiveQuery(async () => {
    const subject = await db.subjects.get(subjectId);
    return subject ? { subject, docs: await db.documents.where('subjectId').equals(subjectId).toArray() } : null;
  }, [subjectId]);
  const [opts, setOpts] = useState(defaultOptions);
  const [est, setEst] = useState<Est | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [spent, setSpent] = useState<{ input: number; output: number } | null>(null);
  const abort = useRef<AbortController | null>(null);

  if (data === undefined) return <PageHeader title="…" back />;
  if (data === null) return <PageHeader title="Matière introuvable" back />;
  const { subject, docs } = data;
  const selected = docs.filter((d) => opts.docNames.includes(d.name));
  const canRun = !!apiKey && (selected.length > 0 || opts.instructions.trim().length > 0);

  const change = (o: typeof opts) => { setOpts(o); setEst(null); };

  const doEstimate = async () => {
    setError(''); setStatus('Calcul de l’estimation…');
    try {
      const plan = await planGeneration(selected, opts.count);
      const e = await estimate(apiKey, model, subject, opts, plan);
      setEst({ ...e, cost: estimateCost(model, e.input, e.output) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStatus('');
    }
  };

  const run = async () => {
    setError('');
    abort.current = new AbortController();
    try {
      setStatus('Préparation des documents…');
      const plan = await planGeneration(selected, opts.count);
      const existing = await db.questions.toCollection().primaryKeys();
      const r = await generate({ apiKey, model, subject, options: opts, plan, existingIds: existing, onStatus: setStatus, signal: abort.current.signal });
      setSpent(r.usage);
      if (!r.result.questions.length) setError(`Aucune question valide n’a été produite.${r.result.errors[0] ? ` Exemple : ${r.result.errors[0].messages.join(' ; ')}` : ''}`);
      else setResult(r.result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStatus('');
      abort.current = null;
    }
  };

  if (result)
    return (
      <>
        <PageHeader title="Relecture" back />
        <main className="mx-auto max-w-xl space-y-3 px-4 pb-6">
          {spent && (
            <p className="tabular text-xs text-muted">
              Consommé : {spent.input.toLocaleString('fr-FR')} tokens en entrée, {spent.output.toLocaleString('fr-FR')} en sortie
              {estimateCost(model, spent.input, spent.output) !== null ? ` (≈ ${fmt(estimateCost(model, spent.input, spent.output)!, 2)} $)` : ''}.
            </p>
          )}
          <ReviewList subject={subject} result={result} onCancel={() => setResult(null)}
            onAdded={(n) => { alert(`${n} question(s) ajoutée(s) à ${subject.name}.`); nav(`/matieres/${subjectId}`, { replace: true }); }} />
        </main>
      </>
    );

  return (
    <>
      <PageHeader title="Générer des QCM" back />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-32">
        {!apiKey ? (
          <section className="card space-y-2 p-4 text-sm">
            <p>La génération directe demande une <b>clé API Anthropic</b>, à saisir dans <Link className="font-semibold text-steel" to="/reglages">Réglages</Link>.</p>
            <p className="text-muted">Sans clé, c’est gratuit aussi : <Link className="font-semibold text-steel" to={`/matieres/${subjectId}/importer`}>copie le prompt</Link>, colle-le dans Claude avec tes documents et recolle la réponse.</p>
          </section>
        ) : (
          <p className="text-xs text-muted">Modèle : <span className="font-mono">{model}</span> (modifiable dans Réglages). Tes documents sont envoyés directement à l’API Anthropic avec ta clé.</p>
        )}
        {docs.length === 0 && <p className="card p-4 text-sm">Aucun document dans cette matière : ajoute tes cours depuis la page de la matière, ou décris le sujet dans les consignes.</p>}

        <GenOptionsForm subject={subject} docs={docs} value={opts} onChange={change} />

        {est && (
          <section className="card p-4 text-sm" aria-live="polite">
            <p className="font-semibold">Estimation</p>
            <p className="tabular text-muted">
              {est.input.toLocaleString('fr-FR')} tokens en entrée (comptés) + ≈ {est.output.toLocaleString('fr-FR')} en sortie, en {est.requests} requête(s)
              {est.cost !== null ? <> · <b className="text-ink">≈ {fmt(est.cost, 2)} $</b></> : ' · prix du modèle inconnu'}.
            </p>
            <p className="mt-1 text-xs text-muted">La sortie est une estimation ; une nouvelle tentative automatique peut s’ajouter si la réponse est mal formée.</p>
          </section>
        )}
        {error && <p role="alert" className="rounded-xl bg-ko/10 p-3 text-sm">{error}</p>}
      </main>

      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-bg/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          {status ? (
            <div className="flex items-center gap-2">
              <p role="status" className="flex-1 text-sm"><span className="mr-2 inline-block animate-spin">⏳</span>{status}</p>
              {abort.current && <button type="button" className="btn-ghost" onClick={() => abort.current?.abort()}>Annuler</button>}
            </div>
          ) : (
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" disabled={!canRun} onClick={doEstimate}>Estimer le coût</button>
              <button type="button" className="btn-primary flex-[2]" disabled={!canRun} onClick={run}>✨ Générer {opts.count} questions</button>
            </div>
          )}
          {apiKey && !canRun && <p className="mt-1 text-center text-xs text-muted">Coche au moins un document (ou écris des consignes).</p>}
        </div>
      </div>
    </>
  );
}
