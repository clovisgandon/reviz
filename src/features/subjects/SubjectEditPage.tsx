import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Subject, Theme } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';
import { DEFAULT_SETTINGS, useSetting } from '@/lib/settings';
import { deleteSubject, freeSubjectId, SUBJECT_COLORS, SUBJECT_EMOJIS, themesFromNames } from '@/lib/subjects';
import { proposeThemes } from '@/features/generation/generate';

/** Créer une matière (route /matieres/nouvelle) ou modifier une matière perso. */
export function SubjectEditPage() {
  const { subjectId } = useParams();
  const nav = useNavigate();
  const isNew = !subjectId;
  const apiKey = useSetting('apiKey');
  const model = useSetting('apiModel');
  const existing = useLiveQuery(async () => {
    if (!subjectId) return null;
    const s = await db.subjects.get(subjectId);
    if (!s) return null;
    const qs = await db.questions.where('subjectId').equals(subjectId).toArray();
    const used = new Map<string, number>();
    for (const q of qs) for (const t of q.themeIds) used.set(t, (used.get(t) ?? 0) + 1);
    const docs = await db.documents.where('subjectId').equals(subjectId).toArray();
    return { s, used, nQ: qs.length, docs };
  }, [subjectId]);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(SUBJECT_EMOJIS[0]);
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [examDate, setExamDate] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [newTheme, setNewTheme] = useState('');
  const [scoring, setScoring] = useState(DEFAULT_SETTINGS.scoring);
  const [duration, setDuration] = useState(60);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!existing) return;
    const s = existing.s;
    setName(s.name); setEmoji(s.emoji); setColor(s.color); setExamDate(s.examDate ?? '');
    setThemes(s.themes); setScoring(s.examConfig.scoring); setDuration(s.examConfig.durationMin);
  }, [existing?.s.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isNew && existing === undefined) return <PageHeader title="…" back />;
  if (!isNew && (existing === null || existing?.s.builtIn)) return <PageHeader title="Matière non modifiable" back />;

  const addTheme = () => {
    if (!newTheme.trim()) return;
    setThemes((t) => themesFromNames([newTheme], t));
    setNewTheme('');
  };

  const save = async () => {
    if (!name.trim()) return setError('Donne un nom à la matière.');
    const base = existing?.s;
    const s: Subject = {
      id: base?.id ?? (await freeSubjectId(name)),
      name: name.trim(), emoji, color, examDate: examDate || undefined,
      themes: themes.length ? themes : [{ id: 'general', name: 'Général' }],
      examConfig: { scoring, durationMin: Math.max(5, duration) },
      builtIn: false, createdAt: base?.createdAt ?? Date.now(),
    };
    await db.subjects.put(s);
    nav(`/matieres/${s.id}`, { replace: true });
  };

  const suggest = async () => {
    if (!existing?.docs.length) return;
    setBusy('Lecture des documents…'); setError('');
    try {
      const r = await proposeThemes(apiKey, model, existing.docs);
      setThemes((t) => themesFromNames(r.themes, t));
      if (r.partial) setError('Thèmes proposés à partir des premiers documents seulement (ils étaient trop lourds pour une seule requête).');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const remove = async () => {
    if (!existing) return;
    const ok = confirm(`Supprimer « ${existing.s.name} » ? Ses ${existing.nQ} questions, ses documents et son historique seront effacés. C’est définitif.`);
    if (!ok) return;
    await deleteSubject(existing.s);
    nav('/matieres', { replace: true });
  };

  return (
    <>
      <PageHeader title={isNew ? 'Nouvelle matière' : 'Modifier la matière'} back />
      <main className="mx-auto max-w-xl space-y-4 px-4 pb-28">
        <section className="card space-y-3 p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Nom</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Mécanique des sols" autoFocus={isNew} />
          </label>
          <div>
            <span className="mb-1 block text-sm font-semibold">Icône</span>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Icône">
              {SUBJECT_EMOJIS.map((e) => (
                <button key={e} type="button" role="radio" aria-checked={emoji === e} onClick={() => setEmoji(e)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 text-xl ${emoji === e ? 'border-steel bg-steel/10' : 'border-transparent bg-surface2'}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm font-semibold">Couleur</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Couleur">
              {SUBJECT_COLORS.map((c, i) => (
                <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={`Couleur ${i + 1}`} onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-full border-4 ${color === c ? 'border-ink' : 'border-surface'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Date d’examen <span className="font-normal text-muted">(optionnel)</span></span>
            <input type="date" className="field w-auto" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </label>
        </section>

        <section className="card space-y-3 p-4" aria-labelledby="th-h">
          <h2 id="th-h" className="text-sm font-semibold">Thèmes</h2>
          {themes.length === 0 && <p className="text-sm text-muted">Aucun thème : un thème « Général » sera créé. Les thèmes inconnus des questions importées sont ajoutés tout seuls.</p>}
          <ul className="space-y-2">
            {themes.map((t, i) => {
              const n = existing?.used.get(t.id) ?? 0;
              return (
                <li key={t.id} className="flex items-center gap-2">
                  <input className="field flex-1" value={t.name} aria-label={`Nom du thème ${i + 1}`}
                    onChange={(e) => setThemes((ts) => ts.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))} />
                  <span className="tabular w-10 text-right text-xs text-muted">{n} q.</span>
                  <button type="button" className="btn-ghost h-11 w-11 shrink-0 px-0" disabled={n > 0} aria-label={`Supprimer le thème ${t.name}`}
                    title={n > 0 ? 'Des questions utilisent ce thème' : undefined}
                    onClick={() => setThemes((ts) => ts.filter((x) => x.id !== t.id))}>✕</button>
                </li>
              );
            })}
          </ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addTheme(); }}>
            <input className="field flex-1" value={newTheme} onChange={(e) => setNewTheme(e.target.value)} placeholder="Nouveau thème" aria-label="Nouveau thème" />
            <button type="submit" className="btn-ghost shrink-0" disabled={!newTheme.trim()}>Ajouter</button>
          </form>
          {!isNew && (
            existing?.docs.length ? (
              apiKey ? (
                <button type="button" className="btn-ghost w-full" disabled={!!busy} onClick={suggest}>{busy || '✨ Proposer des thèmes à partir des documents'}</button>
              ) : <p className="text-xs text-muted">Avec une clé API (Réglages), l’IA peut proposer les thèmes à partir de tes documents.</p>
            ) : <p className="text-xs text-muted">Ajoute des documents à la matière pour que l’IA puisse proposer des thèmes.</p>
          )}
          {isNew && <p className="text-xs text-muted">Crée la matière, ajoute tes documents, puis reviens ici pour faire proposer les thèmes par l’IA.</p>}
        </section>

        <section className="card divide-y divide-line" aria-label="Barème du partiel blanc">
          <p className="px-4 py-3 text-sm font-semibold">Barème du partiel blanc (QCM)</p>
          {(['right', 'wrong', 'blank'] as const).map((k) => (
            <label key={k} className="flex min-h-[52px] items-center justify-between px-4">
              <span className="text-sm">{k === 'right' ? 'Bonne réponse' : k === 'wrong' ? 'Mauvaise réponse' : 'Sans réponse'}</span>
              <input type="number" inputMode="decimal" step="0.5" className="field tabular w-24 text-right" value={scoring[k]}
                onChange={(e) => setScoring({ ...scoring, [k]: Number(e.target.value) })} />
            </label>
          ))}
          <label className="flex min-h-[52px] items-center justify-between px-4">
            <span className="text-sm">Durée (min)</span>
            <input type="number" inputMode="numeric" min={5} step={5} className="field tabular w-24 text-right" value={duration} onChange={(e) => setDuration(Number(e.target.value) || 60)} />
          </label>
        </section>

        {error && <p role="alert" className="rounded-xl bg-ko/10 p-3 text-sm">{error}</p>}

        {!isNew && (
          <button type="button" className="w-full py-3 text-sm font-semibold text-ko" onClick={remove}>Supprimer cette matière</button>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-20 border-t border-line bg-bg/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <button type="button" className="btn-primary w-full text-lg" onClick={save}>{isNew ? 'Créer la matière' : 'Enregistrer'}</button>
        </div>
      </div>
    </>
  );
}
