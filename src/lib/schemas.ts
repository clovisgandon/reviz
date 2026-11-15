import { z } from 'zod';

/** Schémas de validation des banques de questions (JSON intégré, import, génération IA). */

export const SourceSchema = z.object({
  docName: z.string().min(1),
  page: z.number().int().positive().optional(),
  note: z.string().optional(),
});

export const DataBlockSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('table'),
    title: z.string(),
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.union([z.string(), z.number()]))),
    note: z.string().optional(),
  }),
  z.object({ kind: z.literal('formula'), title: z.string().optional(), latex: z.string().min(1) }),
  z.object({ kind: z.literal('text'), title: z.string().optional(), content: z.string().min(1) }),
]);

const ChoiceSchema = z.object({ id: z.string().min(1), text: z.string().min(1) });
const NumericSchema = z.object({
  value: z.number().finite(),
  unit: z.string(),
  tolerancePct: z.number().nonnegative().optional(),
});

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    subjectId: z.string().min(1),
    themeIds: z.array(z.string().min(1)).min(1),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    type: z.enum(['single', 'multi', 'truefalse', 'numeric', 'order']),
    prompt: z.string().min(1),
    figure: z.object({ kind: z.enum(['svg', 'image']), content: z.string(), alt: z.string() }).optional(),
    data: z.array(DataBlockSchema).optional(),
    choices: z.array(ChoiceSchema).optional(),
    answer: z.union([z.array(z.string().min(1)).min(1), NumericSchema]),
    explanation: z.string().min(1),
    wrongChoiceHints: z.record(z.string()).optional(),
    source: z.array(SourceSchema).optional(),
    tags: z.array(z.string()).optional(),
    origin: z.enum(['builtin', 'ai', 'import', 'manual']),
    examStyle: z.boolean().optional(),
  })
  .superRefine((q, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (q.type === 'numeric') {
      if (Array.isArray(q.answer)) issue('numeric : answer doit être { value, unit }');
      return;
    }
    if (!Array.isArray(q.answer)) return issue(`${q.type} : answer doit être une liste d'ids`);
    const ids = new Set((q.choices ?? []).map((c) => c.id));
    if (ids.size < 2) issue('au moins 2 choix');
    if (ids.size !== (q.choices ?? []).length) issue('ids de choix en double');
    for (const a of q.answer) if (!ids.has(a)) issue(`réponse « ${a} » absente des choix`);
    if ((q.type === 'single' || q.type === 'truefalse') && q.answer.length !== 1) issue(`${q.type} : une seule bonne réponse`);
    if (q.type === 'truefalse' && ids.size !== 2) issue('truefalse : exactement 2 choix');
    if (q.type === 'order' && q.answer.length !== ids.size) issue('order : la réponse doit lister tous les choix');
    for (const k of Object.keys(q.wrongChoiceHints ?? {})) if (!ids.has(k)) issue(`indice pour un choix inconnu « ${k} »`);
  });

export const QuestionBankSchema = z.array(QuestionSchema);

export const FlashcardSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  themeIds: z.array(z.string()).min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  source: z.array(SourceSchema).optional(),
});
