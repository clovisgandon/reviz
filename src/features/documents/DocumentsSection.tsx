import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { ACCEPT, addDocuments, fmtSize, isImage, isPdf } from '@/lib/documents';
import { ChevronRightIcon } from '@/components/Icons';

/** Liste des documents d'une matière : ajout (app Fichiers de l'iPhone), aperçu, suppression. */
export function DocumentsSection({ subjectId }: { subjectId: string }) {
  const docs = useLiveQuery(() => db.documents.where('subjectId').equals(subjectId).sortBy('addedAt'), [subjectId]);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setMsg('');
    const r = await addDocuments(subjectId, [...files], (n) => setBusy(`Lecture de ${n}…`));
    setBusy('');
    if (input.current) input.current.value = '';
    setMsg(r.failed.length ? `Impossible de lire : ${r.failed.join(', ')}.` : `${r.added} document(s) ajouté(s).`);
    // Demande au navigateur de ne pas effacer ces fichiers en cas de manque de place.
    void navigator.storage?.persist?.();
  };

  const remove = async (id: string, name: string) => {
    if (confirm(`Supprimer « ${name} » de l’appli ? Les questions déjà créées restent.`)) await db.documents.delete(id);
  };

  return (
    <section aria-labelledby="docs-h">
      <h2 id="docs-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Documents</h2>
      <div className="card divide-y divide-line">
        {docs?.map((d) => (
          <div key={d.id} className="flex items-center gap-2 pr-2">
            <Link to={`/document/${d.id}`} className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 px-4">
              <span className="text-xl" aria-hidden>{isPdf(d) ? '📄' : isImage(d) ? '🖼️' : '📝'}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{d.name}</span>
                <span className="tabular block text-xs text-muted">{fmtSize(d.blob.size)}{isPdf(d) && d.pages ? ` · ${d.pages.length} pages` : ''}</span>
              </span>
              <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
            </Link>
            <button type="button" className="h-11 w-11 shrink-0 rounded-xl text-muted" aria-label={`Supprimer ${d.name}`} onClick={() => remove(d.id, d.name)}>✕</button>
          </div>
        ))}
        {docs?.length === 0 && <p className="p-4 text-sm text-muted">Aucun document. Ajoute tes cours (PDF, images, texte) : ils servent à générer des questions et à ouvrir les sources à la bonne page.</p>}
        <div className="p-3">
          <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" id={`docs-${subjectId}`} onChange={(e) => onFiles(e.target.files)} />
          <label htmlFor={`docs-${subjectId}`} className={`btn-ghost w-full cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            {busy || '+ Ajouter des documents'}
          </label>
          {msg && <p className="mt-2 text-center text-xs text-muted" role="status">{msg}</p>}
        </div>
      </div>
    </section>
  );
}
