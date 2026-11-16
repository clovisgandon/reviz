import { db } from '@/db/db';
import type { DocumentFile } from './types';
import { uid } from './random';
import type { ContentBlock } from './anthropic';
import { extractPdfPages } from './pdf';

export const ACCEPT = '.pdf,.png,.jpg,.jpeg,.txt,.md';

export function mimeOf(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'md' ? 'text/markdown' : 'text/plain';
}
export const isPdf = (d: { mime: string }) => d.mime === 'application/pdf';
export const isImage = (d: { mime: string }) => d.mime.startsWith('image/');

/** Stocke les fichiers (Blob dans IndexedDB) et extrait le texte page par page. */
export async function addDocuments(subjectId: string, files: File[], onProgress?: (name: string) => void): Promise<{ added: number; failed: string[] }> {
  const failed: string[] = [];
  let added = 0;
  for (const file of files) {
    onProgress?.(file.name);
    const mime = mimeOf(file);
    try {
      let pages: DocumentFile['pages'];
      if (mime === 'application/pdf') pages = await extractPdfPages(file);
      else if (mime.startsWith('text/')) pages = [{ n: 1, text: await file.text() }];
      await db.documents.put({ id: uid('d-'), subjectId, name: file.name, mime, blob: file, pages, addedAt: Date.now() });
      added++;
    } catch {
      failed.push(file.name);
    }
  }
  return { added, failed };
}

const base = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').trim();

/** Retrouve le document cité par une source (« POLY_2026_metal.pdf », avec ou sans extension). */
export function matchDoc<T extends { name: string }>(docs: T[], docName: string): T | undefined {
  const b = base(docName);
  return docs.find((d) => d.name.toLowerCase() === docName.toLowerCase()) ?? docs.find((d) => base(d.name) === b);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

/**
 * Découpe les documents en paquets envoyables à l'API.
 * - PDF ≤ 100 pages et ≤ 20 Mo : envoyé tel quel (bloc document) pour que les schémas et tableaux soient lus ;
 * - PDF plus gros : texte extrait, par tranches de 80 pages, avec les numéros de page ;
 * - image : bloc image ; texte / Markdown : bloc texte.
 * Un paquet ne dépasse pas ~20 Mo ni 100 pages de PDF.
 */
export type Packet = { blocks: ContentBlock[]; label: string; bytes: number; pdfPages: number };
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PAGES = 100;
const TEXT_SLICE = 80;

export async function buildPackets(docs: DocumentFile[]): Promise<Packet[]> {
  const units: Packet[] = [];
  for (const d of docs) {
    const nPages = d.pages?.length ?? 0;
    if (isPdf(d) && nPages <= MAX_PAGES && d.blob.size <= MAX_BYTES) {
      units.push({ blocks: [{ type: 'document', title: d.name, source: { type: 'base64', media_type: 'application/pdf', data: await blobToBase64(d.blob) } }], label: d.name, bytes: d.blob.size * 1.34, pdfPages: nPages });
    } else if (isImage(d)) {
      if (d.blob.size > 5 * 1024 * 1024) continue; // limite API par image
      units.push({ blocks: [{ type: 'text', text: `Image : ${d.name}` }, { type: 'image', source: { type: 'base64', media_type: d.mime, data: await blobToBase64(d.blob) } }], label: d.name, bytes: d.blob.size * 1.34, pdfPages: 0 });
    } else if (d.pages?.length) {
      for (let i = 0; i < d.pages.length; i += TEXT_SLICE) {
        const slice = d.pages.slice(i, i + TEXT_SLICE);
        const text = `Document : ${d.name}${isPdf(d) ? ` (pages ${slice[0].n} à ${slice[slice.length - 1].n})` : ''}\n\n` + slice.map((p) => (isPdf(d) ? `[page ${p.n}]\n${p.text}` : p.text)).join('\n\n');
        units.push({ blocks: [{ type: 'text', text }], label: isPdf(d) ? `${d.name} p.${slice[0].n}-${slice[slice.length - 1].n}` : d.name, bytes: text.length, pdfPages: 0 });
      }
    }
  }
  const packets: Packet[] = [];
  for (const u of units) {
    const last = packets[packets.length - 1];
    if (last && last.bytes + u.bytes <= MAX_BYTES && last.pdfPages + u.pdfPages <= MAX_PAGES) {
      last.blocks.push(...u.blocks);
      last.bytes += u.bytes;
      last.pdfPages += u.pdfPages;
      last.label += ` + ${u.label}`;
    } else packets.push({ ...u, blocks: [...u.blocks] });
  }
  return packets;
}

export function fmtSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
}
