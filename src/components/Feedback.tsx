import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { matchDoc } from '@/lib/documents';
import type { Question } from '@/lib/types';
import { answerText, givenText, type Given } from '@/lib/scoring';
import { db } from '@/db/db';
import { uid } from '@/lib/random';
import { Rich, RichInline } from './Rich';

const LEVELS = ['', '★', '★★', '★★★'];
export const levelStars = (l: number) => LEVELS[l] ?? '';

/** Sources : cliquables quand le document est stocké dans l'appli (ouvre la visionneuse à la bonne page). */
export function Sources({ q }: { q: Question }) {
  const docs = useLiveQuery(
    async () => (q.source?.length ? (await db.documents.where('subjectId').equals(q.subjectId).toArray()).map((d) => ({ id: d.id, name: d.name })) : []),
    [q.subjectId, q.source?.length],
  );
  if (!q.source?.length) return null;
  return (
    <ul className="mt-3 space-y-1 text-sm text-muted">
      {q.source.map((s, i) => {
        const d = docs && matchDoc(docs, s.docName);
        const label = (
          <>
            <span className="font-medium text-ink">{s.docName}</span>
            {s.page ? ` p.${s.page}` : ''}
          </>
        );
        return (
          <li key={i}>
            📖 Source :{' '}
            {d ? (
              <Link to={`/document/${d.id}${s.page ? `?page=${s.page}` : ''}`} className="underline decoration-steel underline-offset-2">
                {label}
              </Link>
            ) : (
              label
            )}
            {s.note ? <span> — {s.note}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function FavoriteButton({ questionId }: { questionId: string }) {
  const fav = useLiveQuery(() => db.favorites.get(questionId), [questionId]);
  return (
    <button
      type="button"
      className="btn-ghost flex-1 text-sm"
      aria-pressed={!!fav}
      onClick={() => (fav ? db.favorites.delete(questionId) : db.favorites.put({ questionId, addedAt: Date.now() }))}
    >
      {fav ? '⭐ Mise de côté' : '☆ Mettre de côté'}
    </button>
  );
}

export function ReportButton({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  if (sent) return <p className="flex-1 self-center text-center text-sm text-muted">Merci, signalement enregistré.</p>;
  if (!open)
    return (
      <button type="button" className="btn-ghost flex-1 text-sm" onClick={() => setOpen(true)}>
        ⚠️ Signaler une erreur
      </button>
    );
  return (
    <form
      className="w-full space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await db.reports.put({ id: uid('r-'), questionId, message: msg.trim() || '(sans détail)', createdAt: Date.now() });
        setSent(true);
      }}
    >
      <textarea className="field min-h-[80px] py-2" placeholder="Qu’est-ce qui ne va pas ?" value={msg} onChange={(e) => setMsg(e.target.value)} />
      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1" onClick={() => setOpen(false)}>
          Annuler
        </button>
        <button type="submit" className="btn-primary flex-1">
          Envoyer
        </button>
      </div>
    </form>
  );
}

/**
 * Correction d'une question : verdict (✅/❌ + texte), bonne réponse,
 * explication selon le cours, pourquoi le distracteur choisi est faux, sources.
 */
export function Feedback({ q, given, correct, points }: { q: Question; given: Given; correct: boolean | null; points?: number }) {
  const wrongHints = Array.isArray(given)
    ? given.filter((id) => q.wrongChoiceHints?.[id] && !(Array.isArray(q.answer) && q.answer.includes(id)))
    : [];
  const verdict =
    correct === true
      ? { icon: '✅', text: 'Juste !', cls: 'border-ok bg-ok/10' }
      : correct === false
        ? { icon: '❌', text: 'Faux', cls: 'border-ko bg-ko/10' }
        : { icon: '➖', text: 'Sans réponse', cls: 'border-line bg-surface2' };
  const [open, setOpen] = useState(correct !== true); // repliée si juste

  return (
    <section aria-live="polite" className={`rounded-2xl border-2 p-4 ${verdict.cls}`}>
      <p className="flex items-center justify-between text-lg font-bold">
        <span>
          {verdict.icon} {verdict.text}
        </span>
        {points !== undefined && <span className="tabular text-base">{points > 0 ? `+${points}` : points} pt</span>}
      </p>
      {correct !== true && (
        <div className="mt-2 text-sm">
          {q.type === 'numeric' && <p>Ta réponse : {givenText(q, given)}</p>}
          <div className="font-semibold">
            <p>Bonne réponse :</p>
            <Rich text={answerText(q)} />
          </div>
        </div>
      )}
      {wrongHints.map((id) => (
        <p key={id} className="mt-2 rounded-lg bg-surface p-2 text-sm">
          <b>Pourquoi ta réponse est fausse :</b> <RichInline text={q.wrongChoiceHints![id]} />
        </p>
      ))}
      <button type="button" className="mt-2 text-sm font-semibold text-steel" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '▾ Masquer l’explication' : '▸ Voir l’explication'}
      </button>
      {open && (
        <div className="mt-2 border-t border-line pt-2 text-[15px]">
          <Rich text={q.explanation} />
          <Sources q={q} />
        </div>
      )}
    </section>
  );
}
