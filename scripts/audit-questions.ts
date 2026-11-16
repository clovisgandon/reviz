/**
 * Audit des banques de questions intégrées (prompt §8.3).
 * Usage : npm run audit:questions  → code de sortie 1 si une règle bloquante échoue.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FlashcardSchema, QuestionSchema } from '../src/lib/schemas';
import { STAB1 } from '../src/subjects/stab1/meta';
import type { Question } from '../src/lib/types';

const dir = join(process.cwd(), 'src/subjects/stab1');
const files = readdirSync(join(dir, 'questions')).filter((f) => f.endsWith('.json'));
const questions: Question[] = files.flatMap((f) => JSON.parse(readFileSync(join(dir, 'questions', f), 'utf8')));
const flashcards = JSON.parse(readFileSync(join(dir, 'flashcards.json'), 'utf8')) as unknown[];
const exams = JSON.parse(readFileSync(join(dir, 'exams.json'), 'utf8')) as { id: string; questionIds: string[] }[];

const fails: string[] = [];
const warns: string[] = [];
const ids = new Set<string>();

for (const q of questions) {
  const r = QuestionSchema.safeParse(q);
  if (!r.success) fails.push(`${q.id} : schéma — ${r.error.issues.map((i) => i.message).join('; ')}`);
  if (ids.has(q.id)) fails.push(`${q.id} : id en double`);
  ids.add(q.id);
  if (q.type === 'single' && Array.isArray(q.answer) && q.answer.length !== 1) fails.push(`${q.id} : single avec ${q.answer.length} réponses`);
  if (q.explanation.length < 150) fails.push(`${q.id} : explication trop courte (${q.explanation.length} car.)`);
  if (!q.source?.length) fails.push(`${q.id} : pas de source`);
  if (q.type === 'numeric' && !q.data?.length && /lis|catalogue|tableau/i.test(q.prompt)) warns.push(`${q.id} : question de lecture sans bloc Données`);
}
for (const f of flashcards) if (!FlashcardSchema.safeParse(f).success) fails.push('flashcard invalide : ' + JSON.stringify(f).slice(0, 60));
for (const e of exams) for (const id of e.questionIds) if (!ids.has(id)) fails.push(`sujet ${e.id} : question inconnue ${id}`);

// Répartition
const byTheme = new Map<string, Question[]>();
for (const q of questions) for (const t of q.themeIds) byTheme.set(t, [...(byTheme.get(t) ?? []), q]);
const lvl = [1, 2, 3].map((l) => questions.filter((q) => q.level === l).length);
const exam = questions.filter((q) => q.examStyle).length;
const pct = (n: number) => Math.round((n / questions.length) * 100);

console.log('\n=== Audit banque STAB 1 ===\n');
console.log(`Questions : ${questions.length}   (objectif ≥ 300)`);
console.log(`Niveaux   : ★ ${lvl[0]} (${pct(lvl[0])} %) · ★★ ${lvl[1]} (${pct(lvl[1])} %) · ★★★ ${lvl[2]} (${pct(lvl[2])} %)   (objectif ≈ 40 / 40 / 20)`);
console.log(`Style examen : ${exam}   (objectif ≥ 60)`);
console.log(`Cartes Flash : ${flashcards.length}   (objectif ≥ 60)`);
console.log(`Types : ${['single', 'multi', 'truefalse', 'numeric', 'order'].map((t) => `${t} ${questions.filter((q) => q.type === t).length}`).join(' · ')}`);
console.log(`Sujets fixes : ${exams.map((e) => `${e.id} (${e.questionIds.length} q.)`).join(', ')}\n`);
console.log('Thème'.padEnd(36), 'Total', ' ★ ', '★★ ', '★★★', 'Exam');
for (const t of STAB1.themes) {
  const list = byTheme.get(t.id) ?? [];
  const c = (l: number) => String(list.filter((q) => q.level === l).length).padStart(3);
  console.log(t.name.padEnd(36), String(list.length).padStart(5), c(1), c(2), c(3), String(list.filter((q) => q.examStyle).length).padStart(4));
  if (list.length < 12) fails.push(`thème ${t.id} : ${list.length} questions (< 12)`);
}
for (const t of byTheme.keys()) if (!STAB1.themes.some((x) => x.id === t)) fails.push(`thème inconnu ${t}`);

if (questions.length < 300) fails.push(`${questions.length} questions (< 300)`);
if (exam < 60) fails.push(`${exam} questions style examen (< 60)`);
if (flashcards.length < 60) fails.push(`${flashcards.length} cartes (< 60)`);
if (Math.abs(pct(lvl[0]) - 40) > 12 || Math.abs(pct(lvl[1]) - 40) > 12 || Math.abs(pct(lvl[2]) - 20) > 10)
  warns.push('répartition des niveaux éloignée de 40/40/20');

console.log('');
for (const w of warns) console.log('⚠', w);
if (fails.length) {
  for (const f of fails) console.log('✗', f);
  console.log(`\n✗ Audit échoué : ${fails.length} problème(s).`);
  process.exit(1);
}
console.log('✓ Audit réussi.');
