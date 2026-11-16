import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { PageHeader } from '@/components/PageHeader';
import { levelStars } from '@/components/Feedback';
import { GENERATORS_BY_SUBJECT } from '@/subjects/stab1/generators';
import { newSeed } from '@/lib/random';
import { db } from '@/db/db';
import { fmt } from '@/lib/format';

const GROUPS = ['Actions', 'Métal', 'Bois', 'Béton armé'] as const;

/** Mode 5 : contrôle sur table (exercices de calcul pas à pas, données aléatoires). */
export function TableListPage() {
  const { subjectId = '' } = useParams();
  const nav = useNavigate();
  const gens = GENERATORS_BY_SUBJECT[subjectId] ?? [];
  // Meilleure note par générateur
  const best = useLiveQuery(async () => {
    const list = await db.attempts.where('mode').equals('table').toArray();
    const m = new Map<string, number>();
    for (const a of list) {
      const id = a.items[0]?.generatorId;
      if (id) m.set(id, Math.max(m.get(id) ?? 0, a.scoreOn20));
    }
    return m;
  }, []);

  return (
    <>
      <PageHeader title="Contrôle sur table" back />
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-6">
        <p className="text-sm text-muted">
          Des exercices rédigés comme au partiel, avec des données tirées au hasard. Chaque étape est corrigée ; une erreur ne se propage pas
          (la suite utilise la bonne valeur, sauf si tu choisis « continuer avec ma valeur »). 1 point par étape, −0,5 si tu prends l’indice.
        </p>
        {gens.length === 0 && <p className="card p-4 text-muted">Pas encore d’exercices de calcul pour cette matière.</p>}
        {GROUPS.map((grp) => {
          const list = gens.filter((g) => g.group === grp);
          if (!list.length) return null;
          return (
            <section key={grp} aria-labelledby={`g-${grp}`}>
              <h2 id={`g-${grp}`} className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {grp}
              </h2>
              <ul className="space-y-2">
                {list.map((g) => (
                  <li key={g.id} className="card p-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-lg bg-steel/10 px-2 py-1 text-xs font-bold text-steel">{g.code}</span>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {g.title} <span className="text-xs text-site">{levelStars(g.level)}</span>
                        </p>
                        <p className="text-xs text-muted">{g.description}</p>
                        {best?.get(g.id) !== undefined && <p className="tabular mt-1 text-xs">Meilleure note : {fmt(best.get(g.id)!, 1)}/20</p>}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" className="btn-primary min-h-[40px] flex-1 text-sm" onClick={() => nav(`/table/${g.id}?seed=${newSeed()}`)}>
                        Sujet aléatoire
                      </button>
                      {g.official?.map((o: { label: string }, i: number) => (
                        <button key={i} type="button" className="btn-ghost min-h-[40px] text-xs" onClick={() => nav(`/table/${g.id}?cas=${i}`)}>
                          📄 {o.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </>
  );
}
