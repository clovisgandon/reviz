import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * pdf.js chargé à la demande (gros module : il ne pèse pas sur le démarrage de l'appli).
 * Build « legacy » : compatible avec les versions d'iOS un peu anciennes.
 */
let lib: Promise<typeof import('pdfjs-dist')> | null = null;
function pdfjs() {
  lib ??= (async () => {
    const [m, worker] = await Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs'),
      import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
    ]);
    m.GlobalWorkerOptions.workerSrc = worker.default;
    return m as unknown as typeof import('pdfjs-dist');
  })();
  return lib;
}

export async function openPdf(blob: Blob): Promise<PDFDocumentProxy> {
  const { getDocument } = await pdfjs();
  return getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
}

/** Texte de chaque page, numéro de page conservé (pour citer « p.23 »). */
export async function extractPdfPages(blob: Blob): Promise<{ n: number; text: string }[]> {
  const doc = await openPdf(blob);
  const pages: { n: number; text: string }[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const tc = await page.getTextContent();
    let text = '';
    for (const it of tc.items) if ('str' in it) text += it.str + (it.hasEOL ? '\n' : ' ');
    pages.push({ n, text: text.replace(/[ \t]+/g, ' ').trim() });
  }
  await doc.destroy();
  return pages;
}
