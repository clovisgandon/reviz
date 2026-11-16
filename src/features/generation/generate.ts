import type { DocumentFile, Subject } from '@/lib/types';
import { buildPackets, type Packet } from '@/lib/documents';
import { callClaude, countTokens, type ContentBlock, type Msg } from '@/lib/anthropic';
import { SYSTEM_PROMPT, THEMES_PROMPT, userInstructions, type GenOptions } from '@/lib/genPrompt';
import { extractJson, normalizeImport, type ImportResult } from '@/lib/importQuestions';

/** Répartit n questions sur les paquets, proportionnellement à leur taille (au moins 1 chacun). */
export function split(n: number, weights: number[]): number[] {
  if (!weights.length) return [n];
  const k = Math.min(n, weights.length);
  const w = weights.slice(0, k);
  const total = w.reduce((s, x) => s + x, 0) || 1;
  const out = w.map((x) => Math.max(1, Math.floor((x / total) * n)));
  let rest = n - out.reduce((s, x) => s + x, 0);
  for (let i = 0; rest > 0; i = (i + 1) % k, rest--) out[i]++;
  for (let i = 0; rest < 0; i = (i + 1) % k) if (out[i] > 1) (out[i]--, rest++);
  return out;
}

function requestFor(subject: Subject, o: GenOptions, packet: Packet | null, count: number): Msg[] {
  const content: ContentBlock[] = [...(packet?.blocks ?? []), { type: 'text', text: userInstructions(subject, { ...o, count }) }];
  return [{ role: 'user', content }];
}

export type Plan = { packets: (Packet | null)[]; counts: number[] };

export async function planGeneration(docs: DocumentFile[], count: number): Promise<Plan> {
  const packets = docs.length ? await buildPackets(docs) : [];
  const used: (Packet | null)[] = packets.length ? packets.slice(0, count) : [null];
  return { packets: used, counts: split(count, used.map((p) => p?.bytes ?? 1)) };
}

/** Estimation avant l'envoi : tokens d'entrée comptés par l'API (gratuit), sortie estimée. */
export async function estimate(apiKey: string, model: string, subject: Subject, o: GenOptions, plan: Plan) {
  let input = 0;
  for (let i = 0; i < plan.packets.length; i++) input += await countTokens({ apiKey, model, system: SYSTEM_PROMPT, messages: requestFor(subject, o, plan.packets[i], plan.counts[i]) });
  return { input, output: o.count * 800, requests: plan.packets.length };
}

/** Génère, valide, et redemande une fois en cas de JSON invalide. */
export async function generate(opts: {
  apiKey: string; model: string; subject: Subject; options: GenOptions; plan: Plan; existingIds: string[];
  onStatus: (s: string) => void; signal?: AbortSignal;
}): Promise<{ result: ImportResult; usage: { input: number; output: number } }> {
  const { plan } = opts;
  let subject = opts.subject;
  const merged: ImportResult = { questions: [], flashcards: [], errors: [], newThemes: [] };
  const usage = { input: 0, output: 0 };
  const taken = [...opts.existingIds];

  for (let i = 0; i < plan.packets.length; i++) {
    const label = plan.packets[i]?.label ?? 'consignes';
    opts.onStatus(`Requête ${i + 1}/${plan.packets.length} · ${plan.counts[i]} question(s) · ${label}`);
    const messages = requestFor(subject, opts.options, plan.packets[i], plan.counts[i]);
    const first = await callClaude({ apiKey: opts.apiKey, model: opts.model, system: SYSTEM_PROMPT, messages, signal: opts.signal });
    usage.input += first.usage.input_tokens;
    usage.output += first.usage.output_tokens;

    let res: ImportResult | null = null;
    let problem = '';
    try {
      res = normalizeImport(extractJson(first.text), subject, 'ai', taken);
      if (res.errors.length) problem = res.errors.map((e) => `- question ${e.index + 1} : ${e.messages.join(' ; ')}`).join('\n');
    } catch (e) {
      problem = (e as Error).message;
    }

    if (problem) {
      opts.onStatus(`Requête ${i + 1} : réponse à corriger, nouvelle tentative…`);
      const retry = await callClaude({
        apiKey: opts.apiKey, model: opts.model, system: SYSTEM_PROMPT, signal: opts.signal,
        messages: [...messages, { role: 'assistant', content: first.text }, { role: 'user', content: `Ta réponse ne respecte pas le schéma :\n${problem}\n\nRenvoie le JSON complet corrigé, et uniquement le JSON.` }],
      });
      usage.input += retry.usage.input_tokens;
      usage.output += retry.usage.output_tokens;
      try {
        const res2 = normalizeImport(extractJson(retry.text), subject, 'ai', taken);
        if (!res || res2.questions.length >= res.questions.length) res = res2;
      } catch (e) {
        if (!res) throw new Error(`Réponse illisible même après une nouvelle tentative : ${(e as Error).message}`);
      }
    }
    if (!res) continue;
    merged.questions.push(...res.questions);
    merged.errors.push(...res.errors);
    merged.newThemes.push(...res.newThemes);
    taken.push(...res.questions.map((q) => q.id));
    // Les thèmes créés par un paquet sont réutilisés par les suivants.
    subject = { ...subject, themes: [...subject.themes, ...res.newThemes] };
  }
  return { result: merged, usage };
}

/** Propose des thèmes à partir des documents (premier paquet seulement : on le signale). */
export async function proposeThemes(apiKey: string, model: string, docs: DocumentFile[]): Promise<{ themes: string[]; partial: boolean }> {
  const packets = await buildPackets(docs);
  if (!packets.length) throw new Error('Aucun document lisible.');
  const r = await callClaude({ apiKey, model, system: 'Tu aides un étudiant à organiser ses révisions.', maxTokens: 4000, messages: [{ role: 'user', content: [...packets[0].blocks, { type: 'text', text: THEMES_PROMPT }] }] });
  const j = extractJson(r.text) as { themes?: unknown };
  const themes = Array.isArray(j.themes) ? j.themes.filter((t): t is string => typeof t === 'string' && !!t.trim()).map((t) => t.trim()) : [];
  if (!themes.length) throw new Error('Pas de thème dans la réponse.');
  return { themes, partial: packets.length > 1 };
}
