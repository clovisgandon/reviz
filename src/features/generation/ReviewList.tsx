import { useState } from 'react';
import type { Question, Subject, Theme } from '@/lib/types';
import type { ImportResult } from '@/lib/importQuestions';
import { QuestionBody } from '@/components/QuestionCard';
import { Rich, RichInline } from '@/components/Rich';
import { levelStars } from '@/components/Feedback';
import { answerText } from '@/lib/scoring';
import { addToBank } from '@/lib/subjects';
import { QuestionEditor } from './QuestionEditor';

/** Relecture avant ajout : je vois chaque question, j'en supprime ou j'en corrige, puis j'ajoute à la banque. */
export function ReviewList({ subject, result, onAdded, onCancel }: { subject: Subject; result: ImportResult; onAdded: (n: number) => void; onCancel: () => void }) {
  const [qs, setQs] = useState<Question[]>(result.questions);
  const [themes, setThemes] = useState<Theme[]>(result.newThemes);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const allThemes = [...subject.themes, ...themes];
  const themeName = (id: string) => allThemes.find((t) => t.id === id)?.name ?? id;
  const subjectView = { ...subject, themes: allThemes };

  const add = async () => {
    setSaving(true);
    const used = new Set(qs.flatMap((q) => q.themeIds).concat(result.flashcards.flatMap((c) => c.themeIds)));
    await addToBank(subject.id, qs, result.flashcards, themes.filter((t) => used.has(t.id)));
    onAdded(qs.length + result.flashcards.length);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <b className="tabular">{qs.length}</b> question(s) prête(s){result.flashcards.length ? <> et <b className="tabular">{result.flashcards.length}</b> carte(s) Flash</> : null}
        {themes.length ? <span className="text-muted"> · nouveaux thèmes : {themes.map((t) => t.name).join(', ')}</span> : null}
      </p>

      {result.errors.length > 0 && (
        <details className="rounded-xl border border-warn bg-warn/10 p-3 text-sm">
          <summary className="cursor-pointer font-semibold">⚠️ {result.errors.length} élément(s) rejeté(s) car invalides</summary>
          <ul className="mt-2 space-y-2">
            {result.errors.map((e) => (
              <li key={e.index}>
                <span className="font-medium">{e.label}</span>
                <ul className="list-disc pl-5 text-xs text-muted">{e.messages.map((m) => <li key={m}>{m}</li>)}</ul>
              </li>
            ))}
          </ul>
        </details>
      )}

      <ol className="space-y-3">
        {qs.map((q, i) => (
          <li key={q.id} className="card p-4">
            {editing === q.id ? (
              <QuestionEditor
                subject={subjectView}
                initial={q}
                saveLabel="Valider"
                onCancel={() => setEditing(null)}
                onSave={(nq, nt) => {
                  if (nt) setThemes((t) => [...t, nt]);
                  setQs((list) => list.map((x) => (x.id === q.id ? nq : x)));
                  setEditing(null);
                }}
              />
            ) : (
              <>
                <p className="mb-2 flex flex-wrap gap-x-2 text-xs text-muted">
                  <span className="font-semibold">{i + 1}.</span>
                  <span>{themeName(q.themeIds[0])}</span>
                  <span>{levelStars(q.level)}</span>
                  {q.examStyle && <span>· style examen</span>}
                </p>
                <QuestionBody q={q} />
                {q.choices && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {q.choices.map((c) => {
                      const ok = Array.isArray(q.answer) && q.answer.includes(c.id) && q.type !== 'order';
                      return <li key={c.id} className={ok ? 'font-semibold text-ok' : ''}>{ok ? '✅' : '◻️'} <RichInline text={c.text} /></li>;
                    })}
                  </ul>
                )}
                <div className="mt-2 text-sm"><b>Réponse :</b> <Rich text={answerText(q)} /></div>
                <button type="button" className="mt-2 text-sm font-semibold text-steel" aria-expanded={open === q.id} onClick={() => setOpen(open === q.id ? null : q.id)}>
                  {open === q.id ? '▾ Masquer l’explication' : '▸ Voir l’explication'}
                </button>
                {open === q.id && (
                  <div className="mt-2 border-t border-line pt-2 text-sm">
                    <Rich text={q.explanation} />
                    {q.source?.map((s, k) => <p key={k} className="mt-1 text-xs text-muted">📖 {s.docName}{s.page ? ` p.${s.page}` : ''}</p>)}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn-ghost flex-1 text-sm" onClick={() => setEditing(q.id)}>✏️ Modifier</button>
                  <button type="button" className="btn-ghost flex-1 text-sm" onClick={() => setQs((list) => list.filter((x) => x.id !== q.id))}>🗑️ Retirer</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>

      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] flex gap-2 rounded-2xl bg-bg/95 py-2 backdrop-blur">
        <button type="button" className="btn-ghost flex-1" onClick={onCancel}>Abandonner</button>
        <button type="button" className="btn-primary flex-[2]" disabled={saving || (!qs.length && !result.flashcards.length) || editing !== null} onClick={add}>
          Ajouter {qs.length + result.flashcards.length} à la banque
        </button>
      </div>
    </div>
  );
}
