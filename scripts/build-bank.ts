/**
 * Compile la banque STAB 1 (src/subjects/stab1/bank/*.ts) en JSON :
 *  - src/subjects/stab1/questions/<thème>.json
 *  - src/subjects/stab1/flashcards.json
 *  - src/subjects/stab1/exams.json (sujets fixes, ids résolus)
 * Usage : npm run bank
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ACTIONS_BANKS } from '../src/subjects/stab1/bank/actions';
import { METAL_BANKS } from '../src/subjects/stab1/bank/metal';
import { BOIS_BANKS } from '../src/subjects/stab1/bank/bois';
import { BA_BANKS } from '../src/subjects/stab1/bank/ba';
import { FLASHCARDS } from '../src/subjects/stab1/bank/flashcards';
import { FIXED_EXAMS } from '../src/subjects/stab1/exams/fixed';
import { FlashcardSchema, QuestionBankSchema } from '../src/lib/schemas';

const root = join(process.cwd(), 'src/subjects/stab1');
const qdir = join(root, 'questions');
mkdirSync(qdir, { recursive: true });
for (const f of readdirSync(qdir)) if (f.endsWith('.json')) rmSync(join(qdir, f));

const banks = [...ACTIONS_BANKS, ...METAL_BANKS, ...BOIS_BANKS, ...BA_BANKS];
const all = banks.flatMap((b) => b.items);
let errors = 0;

for (const b of banks) {
  const r = QuestionBankSchema.safeParse(b.items);
  if (!r.success) {
    errors++;
    for (const i of r.error.issues) console.error(`✗ ${b.theme} [${i.path.join('.')}] ${i.message}`);
  }
  writeFileSync(join(qdir, `${b.theme}.json`), JSON.stringify(b.items, null, 2) + '\n');
}

const ids = all.map((q) => q.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) {
  errors++;
  console.error('✗ ids en double :', [...new Set(dup)].join(', '));
}

const fc = FlashcardSchema.array().safeParse(FLASHCARDS);
if (!fc.success) {
  errors++;
  console.error('✗ flashcards :', fc.error.issues.map((i) => i.message).join('; '));
}
writeFileSync(join(root, 'flashcards.json'), JSON.stringify(FLASHCARDS, null, 2) + '\n');

const exams = FIXED_EXAMS.map((e) => {
  const questionIds = e.tag ? all.filter((q) => q.tags?.includes(e.tag!)).map((q) => q.id) : e.questionIds;
  for (const id of questionIds)
    if (!ids.includes(id)) {
      errors++;
      console.error(`✗ sujet ${e.id} : question inconnue ${id}`);
    }
  const { tag: _tag, ...rest } = e;
  return { ...rest, questionIds };
});
writeFileSync(join(root, 'exams.json'), JSON.stringify(exams, null, 2) + '\n');

console.log(`${all.length} questions, ${banks.length} thèmes, ${FLASHCARDS.length} cartes, ${exams.length} sujets fixes.`);
if (errors) {
  console.error(`${errors} erreur(s).`);
  process.exit(1);
}
