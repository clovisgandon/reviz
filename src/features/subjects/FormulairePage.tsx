import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { DataBlockView } from '@/components/DataBlocks';
import { FICHE } from '@/subjects/stab1/formulaire/fiche';

/** Fiche formulaire d'une matière (pour l'instant : STAB 1 uniquement). */
export function FormulairePage() {
  const { subjectId = '' } = useParams();
  const sections = subjectId === 'stab1' ? FICHE : [];
  return (
    <>
      <PageHeader title="Formulaire" back />
      <main className="mx-auto max-w-xl space-y-3 px-4 pb-6">
        {sections.length === 0 && <p className="card p-4 text-muted">Pas de fiche formulaire pour cette matière.</p>}
        <nav aria-label="Sommaire" className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a key={s.id} href={`#/matieres/${subjectId}/formulaire`} onClick={(e) => (e.preventDefault(), document.getElementById(`f-${s.id}`)?.scrollIntoView({ behavior: 'smooth' }))} className="min-h-[40px] rounded-full border border-line bg-surface px-3 py-2 text-sm">
              {s.title.split(' (')[0].split(' —')[0]}
            </a>
          ))}
        </nav>
        {sections.map((s) => (
          <details key={s.id} id={`f-${s.id}`} open={s.id !== 'acier'} className="card scroll-mt-24 px-3 py-2">
            <summary className="flex min-h-[44px] cursor-pointer items-center text-lg font-semibold">{s.title}</summary>
            {s.blocks.map((b, i) => (
              <DataBlockView key={i} block={b} />
            ))}
          </details>
        ))}
      </main>
    </>
  );
}
