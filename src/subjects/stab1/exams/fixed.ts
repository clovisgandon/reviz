/**
 * Sujets fixes de STAB 1 : reproduisent les documents officiels avec leurs valeurs exactes.
 * Les questions sont dans la banque (tags « qcm-A » et « partiel-2023 »).
 */
export type FixedExam = {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
  /** barème +2/−1/0 et correction à la fin (comme le vrai QCM) */
  examScoring: boolean;
  durationMin?: number;
  /** si présent : questions de la banque portant ce tag, dans l'ordre de la banque */
  tag?: string;
};

export const QCM_NEIGE_VENT_A: FixedExam = {
  id: 'qcm-neige-vent-A',
  title: 'QCM neige et vent – A',
  description: 'Le QCM corrigé du cours, dans l’ordre, barème +2 / −1 / 0, correction à la fin.',
  examScoring: true,
  durationMin: 15,
  questionIds: [
    'stab1-qcmA-001',
    'stab1-neige-qcmA-002',
    'stab1-neige-qcmA-003',
    'stab1-neige-qcmA-004',
    'stab1-vent-qcmA-005',
    'stab1-vent-qcmA-006',
    'stab1-vent-qcmA-007',
    'stab1-vent-qcmA-008',
    'stab1-vent-qcmA-009',
    'stab1-vent-qcmA-010',
    'stab1-vent-cpe-001',
  ],
};

export const PARTIEL_2023: FixedExam = {
  id: 'partiel-2023',
  title: 'Partiel 2023 (métal + bois)',
  description: 'Les questions du partiel 2023 avec ses valeurs exactes, en correction immédiate (le contrôle sur table détaillé arrive à l’étape 5).',
  examScoring: false,
  // Toutes les questions taguées « partiel-2023 », métal puis bois (résolu par scripts/build-bank.ts).
  questionIds: [],
  tag: 'partiel-2023',
};

export const FIXED_EXAMS = [QCM_NEIGE_VENT_A, PARTIEL_2023];
