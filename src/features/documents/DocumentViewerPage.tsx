import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { db } from '@/db/db';
import { isImage, isPdf } from '@/lib/documents';
import { openPdf } from '@/lib/pdf';
import { Rich } from '@/components/Rich';
import { CloseIcon } from '@/components/Icons';

/** Visionneuse plein écran : PDF page par page (pdf.js), image, ou texte. `?page=23` ouvre la page 23. */
export function DocumentViewerPage() {
  const { docId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const doc = useLiveQuery(async () => (await db.documents.get(docId)) ?? null, [docId]);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const task = useRef<RenderTask | null>(null);

  const numPages = pdf?.numPages ?? 1;
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), numPages);
  const go = (n: number) => setParams({ page: String(Math.min(Math.max(1, n), numPages)) }, { replace: true });

  useEffect(() => {
    if (!doc || !isPdf(doc)) return;
    let alive = true;
    let opened: PDFDocumentProxy | null = null;
    openPdf(doc.blob).then((p) => (alive ? setPdf((opened = p)) : void p.destroy())).catch(() => setFailed(true));
    return () => {
      alive = false;
      void opened?.destroy();
    };
  }, [doc]);

  // Rendu de la page à la largeur de l'écran × zoom, net sur écran Retina.
  useEffect(() => {
    if (!pdf || !canvas.current || !box.current) return;
    let cancelled = false;
    (async () => {
      const p = await pdf.getPage(page);
      if (cancelled || !canvas.current || !box.current) return;
      const base = p.getViewport({ scale: 1 });
      const scale = ((box.current.clientWidth - 16) / base.width) * zoom;
      const vp = p.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
      const c = canvas.current;
      c.width = vp.width;
      c.height = vp.height;
      c.style.width = `${vp.width / (window.devicePixelRatio || 1)}px`;
      task.current?.cancel();
      task.current = p.render({ canvasContext: c.getContext('2d')!, viewport: vp });
      await task.current.promise.catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [pdf, page, zoom]);

  const text = useMemo(() => (doc && !isPdf(doc) && !isImage(doc) ? (doc.pages?.[0]?.text ?? '') : ''), [doc]);
  const imgUrl = useMemo(() => (doc && isImage(doc) ? URL.createObjectURL(doc.blob) : ''), [doc]);
  useEffect(() => () => { if (imgUrl) URL.revokeObjectURL(imgUrl); }, [imgUrl]);

  if (doc === null)
    return (
      <main className="p-6 pt-[calc(24px+env(safe-area-inset-top))] text-center">
        <p>Ce document n’est pas dans l’appli.</p>
        <button type="button" className="btn-primary mt-4" onClick={() => nav(-1)}>Retour</button>
      </main>
    );

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-safe-t backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2">
          <button type="button" onClick={() => nav(-1)} aria-label="Fermer" className="flex h-11 w-11 items-center justify-center text-muted">
            <CloseIcon className="h-6 w-6" />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{doc?.name}</p>
          {pdf && (
            <>
              <button type="button" className="btn-ghost h-11 w-11 px-0" aria-label="Dézoomer" disabled={zoom <= 1} onClick={() => setZoom((z) => Math.max(1, z - 0.5))}>−</button>
              <button type="button" className="btn-ghost h-11 w-11 px-0" aria-label="Zoomer" disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, z + 0.5))}>+</button>
            </>
          )}
        </div>
      </header>

      <div ref={box} className="mx-auto w-full max-w-3xl flex-1 overflow-x-auto p-2 pb-[calc(88px+env(safe-area-inset-bottom))]">
        {failed && <p className="p-4 text-center text-sm">Impossible d’ouvrir ce PDF.</p>}
        {doc && isPdf(doc) && <canvas ref={canvas} className="mx-auto block rounded-md bg-white shadow" aria-label={`Page ${page} sur ${numPages}`} />}
        {doc && isImage(doc) && <img src={imgUrl} alt={doc.name} className="mx-auto max-w-full rounded-md" style={{ width: `${zoom * 100}%`, maxWidth: 'none' }} />}
        {text && <div className="card p-4"><Rich text={text} /></div>}
      </div>

      {pdf && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur" aria-label="Pages">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <button type="button" className="btn-ghost flex-1" disabled={page <= 1} onClick={() => go(page - 1)}>‹ Préc.</button>
            <form className="flex items-center gap-1" onSubmit={(e) => { e.preventDefault(); go(Number(pageInput) || page); setPageInput(''); }}>
              <input inputMode="numeric" aria-label="Aller à la page" className="field tabular w-16 text-center" placeholder={String(page)} value={pageInput} onChange={(e) => setPageInput(e.target.value)} />
              <span className="tabular text-sm text-muted">/ {numPages}</span>
            </form>
            <button type="button" className="btn-ghost flex-1" disabled={page >= numPages} onClick={() => go(page + 1)}>Suiv. ›</button>
          </div>
        </nav>
      )}
    </div>
  );
}
