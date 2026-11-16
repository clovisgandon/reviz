import type { QuestionType, Subject } from './types';

/** Options du formulaire de génération (IA ou prompt à copier). */
export type GenOptions = {
  themeNames: string[]; // vide = détecter automatiquement
  level: 1 | 2 | 3 | 'mix';
  count: number;
  types: QuestionType[];
  examStyle: boolean;
  instructions: string;
  docNames: string[];
};

export const TYPE_LABEL: Record<QuestionType, string> = {
  single: 'une bonne réponse',
  multi: 'plusieurs bonnes réponses',
  truefalse: 'vrai / faux',
  numeric: 'valeur numérique',
  order: 'remettre dans l’ordre',
};

const SCHEMA = `{
  "questions": [
    {
      "theme": "nom d'un thème (de préférence un de la liste fournie)",
      "level": 1 | 2 | 3,                    // 1 découverte, 2 application, 3 expert
      "type": "single" | "multi" | "truefalse" | "numeric" | "order",
      "prompt": "énoncé en Markdown, formules KaTeX entre $...$ ou $$...$$",
      "data": [                              // optionnel : tout tableau / valeur nécessaire pour répondre
        { "kind": "table", "title": "…", "columns": ["…"], "rows": [["…", 1.2]], "note": "…" },
        { "kind": "formula", "title": "…", "latex": "…" },
        { "kind": "text", "title": "…", "content": "…" }
      ],
      "choices": [ { "id": "a", "text": "…" }, { "id": "b", "text": "…" } ],   // pas pour numeric
      "answer": ["b"],                       // ids des bonnes réponses ; order : tous les ids dans le bon ordre
                                             // numeric : { "value": 12.5, "unit": "kN·m", "tolerancePct": 2 }
      "explanation": "explication pédagogique complète (Markdown + KaTeX) : notion, formule, calcul posé, piège",
      "wrongChoiceHints": { "a": "pourquoi a est faux" },   // optionnel
      "source": [ { "docName": "nom exact du fichier", "page": 23 } ],
      "tags": ["formule"],                   // optionnel
      "examStyle": true                      // utilisable dans un partiel blanc
    }
  ]
}`;

/** Prompt système : règles de qualité et format de sortie. Identique pour l'API et pour le prompt copié. */
export const SYSTEM_PROMPT = `Tu es un enseignant qui écrit des questions de révision pour un étudiant, à partir de ses documents de cours.

Règles :
- Écris en français.
- Chaque question est fidèle aux documents fournis : n'invente ni valeur, ni formule, ni règle qui n'y figure pas. Si une donnée vient d'ailleurs, dis-le dans l'explication.
- Une seule interprétation possible de l'énoncé ; une seule réponse défendable (ou un ensemble net pour "multi").
- Distracteurs plausibles, tirés des erreurs classiques d'étudiant : oubli d'un coefficient, confusion de deux grandeurs voisines, erreur d'unité (kN / N, m / mm, MPa / kN/cm²), formule appliquée hors de son domaine, oubli d'un facteur (√3, 2, γ…).
- L'explication est pédagogique : rappel de la notion, formule en KaTeX, calcul posé avec les valeurs si c'est un calcul, piège classique. Elle cite le document et la page dans "source".
- Si répondre demande un tableau, un abaque ou une valeur qu'on aurait le jour de l'examen, mets-le dans "data".
- Pour "numeric", donne la valeur attendue avec son unité ; la tolérance par défaut est 2 %.
- Varie les questions : notions, calculs, pièges, ordres de grandeur.

Format de sortie : réponds UNIQUEMENT par un objet JSON valide, sans texte avant ni après, sans bloc de code, conforme à ce schéma (les commentaires // ne doivent pas apparaître dans ta réponse) :
${SCHEMA}`;

/** Consigne de la demande (thèmes, niveau, nombre…). */
export function userInstructions(subject: Subject, o: GenOptions): string {
  const level = o.level === 'mix' ? 'un mélange des niveaux 1, 2 et 3' : `niveau ${o.level}`;
  const themes = o.themeNames.length
    ? `Thèmes demandés : ${o.themeNames.join(' ; ')}.`
    : `Détecte toi-même les thèmes. Thèmes existants de la matière (réutilise leur nom exact quand ça colle) : ${subject.themes.map((t) => t.name).join(' ; ') || 'aucun pour l’instant'}.`;
  return [
    `Matière : ${subject.name}.`,
    o.docNames.length ? `Documents fournis : ${o.docNames.join(' ; ')}. Dans "source", utilise exactement ces noms.` : '',
    themes,
    `Écris ${o.count} questions, ${level}.`,
    `Types autorisés : ${o.types.map((t) => `"${t}" (${TYPE_LABEL[t]})`).join(', ')}.`,
    o.examStyle ? 'Style examen : questions comme on les trouverait dans un partiel (examStyle: true).' : 'Questions d’entraînement (examStyle: false sauf si elles sont vraiment du niveau d’un partiel).',
    o.instructions.trim() ? `Consignes supplémentaires : ${o.instructions.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Prompt complet à copier dans Claude (mode sans clé API). */
export function copyablePrompt(subject: Subject, o: GenOptions): string {
  return `${SYSTEM_PROMPT}

---

${userInstructions(subject, o)}

Joins mes documents de cours à ce message et appuie-toi uniquement sur eux. Je recollerai ta réponse JSON dans mon appli de révision.`;
}

/** Demande de thèmes à partir des documents (création de matière). */
export const THEMES_PROMPT = `À partir de ces documents de cours, propose entre 5 et 15 thèmes de révision qui couvrent tout le contenu, dans l'ordre du cours.
Réponds UNIQUEMENT par un objet JSON : { "themes": ["nom court du thème 1", "nom court du thème 2"] }. Noms en français, 2 à 6 mots.`;
