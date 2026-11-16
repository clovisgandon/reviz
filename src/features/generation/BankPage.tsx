import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { PageHeader } from '@/components/PageHeader';
import { levelStars } from '@/components/Feedback';
import { RichInline } from '@/components/Rich';
import { deleteQuestion } from '@/lib/subjects';
import { QuestionEditor } from './QuestionEditor';

const ORIGIN = { builtin: 'intégrée', ai: 'IA', import: 'importée', manual: 'écrite à la main' } as const;

/** Banque de questions d'une matière : recherche, filtre par thème, modification / suppression des questions perso. */
export function BankPage() {
  const { subjectId = '' } = useParams();
  const data = useLiveQuery(async () => {
    const subject = await db.subjects.get(subjectId);
    return subject ? { subject, questions: await db.questions.where('subjectId').equals(subjectId).toArray() } : null;
  }, [subjectId]);
  const [theme, setTheme] = useState('all');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(40);

  const list = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    return data.questions.filter((q) => (theme === 'all' || q.themeIds.includes(theme)) && (!s || q.prompt.toLowerCase().includes(s) || q.explanation.toLowerCase().includes(s)));
  }, [data, theme, search]);

  if (data === undefined) return <PageHeader title="…" back />;
  if (data === null) return <PageHeader title="Matière introuvable" back />;
  const name = (id: string) => data.subject.themes.find((t) => t.id === id)?.name ?? id;

  return (
    <>
      <PageHeader title="Banque de questions" back right={<Link to={`/matieres/${subjectId}/question/nouvelle`} className="btn-ghost h-10 px-3 text-sm">+ Écrire</Link>} />
      <main className="mx-auto max-w-xl space-y-3 px-4 pb-6">
        <div className="flex gap-2">
          <input type="search" className="field flex-1" placeholder="Rechercher" aria-label="Rechercher" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="field w-36 shrink-0" aria-label="Thème" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="all">Tous thèmes</option>
            {data.subject.themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <p className="tabular text-xs text-muted">{list.length} question(s)</p>
        <ul className="space-y-2">
          {list.slice(0, limit).map((q) => (
            <li key={q.id}>
              <Link to={`/matieres/${subjectId}/question/${encodeURIComponent(q.id)}`} className="card block p-3">
                <span className="line-clamp-2 text-sm"><RichInline text={q.prompt.split('\n')[0]} /></span>
                <span className="mt-1 block text-xs text-muted">{name(q.themeIds[0])} · {levelStars(q.level)} · {ORIGIN[q.origin]}</span>
              </Link>
            </li>
          ))}
        </ul>
        {list.length > limit && <button type="button" className="btn-ghost w-full" onClick={() => setLimit((l) => l + 40)}>Afficher plus</button>}
        {data.questions.length === 0 && <p className="card p-4 text-sm text-muted">Banque vide. Génère, importe ou écris des questions depuis la page de la matière.</p>}
      </main>
    </>
  );
}

/** Écrire une question (`nouvelle`) ou modifier / supprimer une question existante. Les questions intégrées sont en lecture seule. */
export function QuestionEditPage() {
  const { subjectId = '', questionId = 'nouvelle' } = useParams();
  const nav = useNavigate();
  const isNew = questionId === 'nouvelle';
  const data = useLiveQuery(async () => {
    const subject = await db.subjects.get(subjectId);
    if (!subject) return null;
    return { subject, q: isNew ? undefined : await db.questions.get(questionId) };
  }, [subjectId, questionId]);

  if (data === undefined) return <PageHeader title="…" back />;
  if (data === null || (!isNew && !data.q)) return <PageHeader title="Question introuvable" back />;
  const { subject, q } = data;
  const readOnly = q?.origin === 'builtin';

  return (
    <>
      <PageHeader title={isNew ? 'Nouvelle question' : readOnly ? 'Question intégrée' : 'Modifier la question'} back />
      <main className="mx-auto max-w-xl space-y-3 px-4 pb-8">
        {readOnly ? (
          <p className="card p-4 text-sm">Les questions intégrées de {subject.name} sont mises à jour avec l’appli et ne se modifient pas ici. Si tu vois une erreur, utilise « Signaler une erreur » après y avoir répondu.</p>
        ) : (
          <div className="card p-4">
            <QuestionEditor
              key={q?.id ?? 'new'}
              subject={subject}
              initial={q}
              saveLabel={isNew ? 'Ajouter à la banque' : 'Enregistrer'}
              onCancel={() => nav(-1)}
              onSave={async (nq, nt) => {
                await db.transaction('rw', [db.subjects, db.questions], async () => {
                  if (nt) await db.subjects.update(subject.id, { themes: [...subject.themes, nt] });
                  await db.questions.put(nq);
                });
                nav(-1);
              }}
            />
          </div>
        )}
        {!isNew && !readOnly && q && (
          <button type="button" className="w-full py-3 text-sm font-semibold text-ko" onClick={async () => {
            if (!confirm('Supprimer cette question ? C’est définitif.')) return;
            await deleteQuestion(q.id);
            nav(-1);
          }}>Supprimer la question</button>
        )}
      </main>
    </>
  );
}
