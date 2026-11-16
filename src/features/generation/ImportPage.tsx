import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { copyablePrompt } from '@/lib/genPrompt';
import { extractJson, normalizeImport, type ImportResult } from '@/lib/importQuestions';
import { defaultOptions, GenOptionsForm } from './GenOptionsForm';
import { ReviewList } from './ReviewList';

/** Mode gratuit (sans clé API) : copier le prompt de génération, puis coller ou importer le JSON obtenu. */
export function ImportPage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const data = useLiveQuery(async () => {
    const subject = await db.subjects.get(subjectId);
    return subject ? { subject, docs: await db.documents.where('subjectId').equals(subjectId).toArray() } : null;
  }, [subjectId]);
  const [opts, setOpts] = useState(defaultOptions);
  const [copied, setCopied] = useState('');
  const [manual, setManual] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  if (data === undefined) return <PageHeader title="…" back />;
  if (data === null) return <PageHeader title="Matière introuvable" back />;
  const { subject, docs } = data;

  const copy = async () => {
    const p = copyablePrompt(subject, opts);
    try {
      await navigator.clipboard.writeText(p);
      setCopied('Prompt copié ✔ Colle-le dans Claude avec tes documents.');
    } catch {
      setManual(p); // presse-papier refusé : on l'affiche pour une copie manuelle
      setCopied('Copie automatique refusée : sélectionne le prompt ci-dessous et copie-le.');
    }
  };

  const parse = async (raw: string) => {
    setError('');
    try {
      const existing = await db.questions.toCollection().primaryKeys();
      const r = normalizeImport(extractJson(raw), subject, 'import', existing);
      if (!r.questions.length && !r.flashcards.length) return setError(`Aucune question valide. ${r.errors[0] ? `Exemple d’erreur : ${r.errors[0].messages.join(' ; ')}` : ''}`);
      setResult(r);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const t = await f.text();
    setText(t);
    await parse(t);
  };

  if (result)
    return (
      <>
        <PageHeader title="Relecture" back />
        <main className="mx-auto max-w-xl px-4 pb-6">
          <ReviewList subject={subject} result={result} onCancel={() => setResult(null)}
            onAdded={(n) => { alert(`${n} élément(s) ajouté(s) à ${subject.name}.`); nav(`/matieres/${subjectId}`, { replace: true }); }} />
        </main>
      </>
    );

  return (
    <>
      <PageHeader title="Importer des questions" back />
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-8">
        <section className="card space-y-3 p-4" aria-labelledby="s1">
          <h2 id="s1" className="font-semibold">1. Copier le prompt de génération</h2>
          <p className="text-sm text-muted">Règle les options, copie le prompt, colle-le dans Claude (claude.ai) en joignant tes documents. Claude te renverra un JSON.</p>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-steel">Options du prompt</summary>
            <div className="mt-3"><GenOptionsForm subject={subject} docs={docs} value={opts} onChange={setOpts} /></div>
          </details>
          <button type="button" className="btn-primary w-full" onClick={copy}>📋 Copier le prompt</button>
          {copied && <p role="status" className="text-sm text-muted">{copied}</p>}
          {manual && (
            <textarea readOnly className="field min-h-[160px] py-2 font-mono text-xs" value={manual} aria-label="Prompt à copier" onFocus={(e) => e.currentTarget.select()} />
          )}
        </section>

        <section className="card space-y-3 p-4" aria-labelledby="s2">
          <h2 id="s2" className="font-semibold">2. Coller la réponse JSON</h2>
          <textarea className="field min-h-[160px] py-2 font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder='[ { "theme": "…", "type": "single", "prompt": "…", "choices": […], "answer": ["a"], "explanation": "…" } ]' aria-label="JSON des questions" />
          <div className="flex gap-2">
            <label className="btn-ghost flex-1 cursor-pointer">
              📁 Choisir un fichier
              <input type="file" accept=".json,application/json,.txt" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <button type="button" className="btn-primary flex-1" disabled={!text.trim()} onClick={() => parse(text)}>Vérifier</button>
          </div>
          {error && <p role="alert" className="rounded-xl bg-ko/10 p-3 text-sm">{error}</p>}
          <p className="text-xs text-muted">Accepté : une liste de questions, ou {'{ "questions": [...], "flashcards": [...] }'}. Les thèmes inconnus sont créés, les ids manquants générés.</p>
        </section>
      </main>
    </>
  );
}
