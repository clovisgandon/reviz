/**
 * Client minimal de l'API Claude, appelé directement depuis le navigateur avec la clé de l'utilisateur
 * (aucun serveur entre les deux). La clé ne sort jamais de l'appareil, sauf vers api.anthropic.com.
 */

const API = 'https://api.anthropic.com/v1';

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string }; title?: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

export type Msg = { role: 'user' | 'assistant'; content: string | ContentBlock[] };

export class ApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
  }
}

// Modèles qui acceptent le repli automatique côté serveur en cas de refus (paramètre `fallbacks`).
const FALLBACK_MODELS = new Set(['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-2', 'claude-fable-5-1']);

/** Prix publics en $ par million de tokens (entrée, sortie), pour l'estimation affichée. */
export const PRICES: Record<string, [number, number]> = {
  'claude-sonnet-5-5': [2, 10],
  'claude-sonnet-5': [2, 10],
  'claude-opus-5-5': [4, 20],
  'claude-haiku-5-5': [0.1, 0.5],
  'claude-fable-5-2': [8, 40],
};

function headers(apiKey: string, beta?: string): HeadersInit {
  return {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
    'anthropic-dangerous-direct-browser-access': 'true',
    ...(beta ? { 'anthropic-beta': beta } : {}),
  };
}

async function post<T>(path: string, apiKey: string, body: unknown, beta?: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { method: 'POST', headers: headers(apiKey, beta), body: JSON.stringify(body), signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new ApiError('Génération annulée.');
    throw new ApiError('Pas de connexion à l’API (hors ligne ?).');
  }
  if (res.ok) return (await res.json()) as T;
  let detail = '';
  try {
    detail = ((await res.json()) as { error?: { message?: string } }).error?.message ?? '';
  } catch {
    /* corps vide */
  }
  const msg =
    res.status === 401 ? 'Clé API refusée : vérifie-la dans Réglages.'
    : res.status === 403 ? 'Cette clé n’a pas accès à ce modèle.'
    : res.status === 404 ? `Modèle introuvable : vérifie son nom dans Réglages. ${detail}`
    : res.status === 413 ? 'Documents trop lourds pour une seule requête : décoche-en ou choisis-en de plus petits.'
    : res.status === 429 ? 'Limite de requêtes atteinte : attends une minute et réessaie.'
    : res.status === 529 || res.status >= 500 ? 'Le service est surchargé : réessaie dans un instant.'
    : `Erreur de l’API (${res.status}) : ${detail}`;
  throw new ApiError(msg, res.status);
}

type MessageResponse = {
  content: { type: string; text?: string }[];
  stop_reason: string;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
};

export type CallResult = { text: string; model: string; usage: MessageResponse['usage'] };

/** Envoie une requête et renvoie le texte de la réponse. */
export async function callClaude(opts: { apiKey: string; model: string; system: string; messages: Msg[]; maxTokens?: number; signal?: AbortSignal }): Promise<CallResult> {
  const fallback = FALLBACK_MODELS.has(opts.model);
  const body = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 32000,
    system: opts.system,
    messages: opts.messages,
    ...(fallback ? { fallbacks: 'default' } : {}),
  };
  const r = await post<MessageResponse>('/messages', opts.apiKey, body, fallback ? 'server-side-fallback-2026-07-01' : undefined, opts.signal);
  if (r.stop_reason === 'refusal') throw new ApiError('Le modèle a refusé de répondre à cette demande. Reformule les consignes ou change de documents.');
  const text = r.content.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('');
  if (r.stop_reason === 'max_tokens') throw new ApiError('Réponse coupée (trop longue) : demande moins de questions à la fois.');
  return { text, model: r.model, usage: r.usage };
}

/** Compte les tokens d'entrée d'une requête (gratuit, sert à l'estimation avant l'envoi). */
export async function countTokens(opts: { apiKey: string; model: string; system: string; messages: Msg[] }): Promise<number> {
  const r = await post<{ input_tokens: number }>('/messages/count_tokens', opts.apiKey, { model: opts.model, system: opts.system, messages: opts.messages });
  return r.input_tokens;
}

/** « Tester la clé » : un comptage de tokens, qui ne coûte rien. */
export async function testKey(apiKey: string, model: string): Promise<void> {
  await countTokens({ apiKey, model, system: 'test', messages: [{ role: 'user', content: 'Bonjour' }] });
}

/** Estimation en dollars (null si le prix du modèle est inconnu). */
export function estimateCost(model: string, inputTokens: number, outputTokens: number): number | null {
  const p = PRICES[model];
  return p ? (inputTokens * p[0] + outputTokens * p[1]) / 1e6 : null;
}
