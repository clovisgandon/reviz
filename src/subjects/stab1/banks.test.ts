import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { QuestionBankSchema } from '@/lib/schemas';
import { STAB1 } from './meta';

const dir = join(__dirname, 'questions');
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const all = files.flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as { id: string; themeIds: string[] }[]);

describe('banques STAB 1', () => {
  it.each(files)('%s respecte le schéma', (f) => {
    const r = QuestionBankSchema.safeParse(JSON.parse(readFileSync(join(dir, f), 'utf8')));
    if (!r.success) throw new Error(r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n'));
  });
  it('ids uniques et thèmes connus', () => {
    const ids = all.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const themes = new Set(STAB1.themes.map((t) => t.id));
    for (const q of all) for (const t of q.themeIds) expect(themes.has(t), `${q.id} → thème ${t}`).toBe(true);
  });
});
