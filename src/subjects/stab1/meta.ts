import type { Subject } from '@/lib/types';

/** Matière livrée avec l'appli. Thèmes = arborescence du prompt §8.2 (voir docs/NOTES_STAB1.md). */
export const STAB1: Subject = {
  id: 'stab1',
  name: 'STAB 1',
  color: '#1f4e79',
  emoji: '🏗️',
  builtIn: true,
  examConfig: {
    // Barème du QCM neige et vent A : +2 / −1 / 0
    scoring: { right: 2, wrong: -1, blank: 0 },
    durationMin: 90,
    includeConcrete: true,
  },
  themes: [
    { id: 'ec0', name: 'Bases EC0' },
    { id: 'charges', name: 'Charges (EC1-1)' },
    { id: 'neige', name: 'Neige (EC1-3)' },
    { id: 'vent', name: 'Vent (EC1-4)' },
    { id: 'stabilite', name: 'Stabilité d’ensemble' },
    { id: 'metal-materiau', name: 'Métal – matériau & profilés' },
    { id: 'metal-elu', name: 'Métal – ELU' },
    { id: 'metal-els', name: 'Métal – ELS' },
    { id: 'metal-pieds-mixte', name: 'Métal – pieds de poteaux & mixte' },
    { id: 'bois-coef', name: 'Bois – matériau & coefficients' },
    { id: 'bois-elu', name: 'Bois – ELU' },
    { id: 'bois-els', name: 'Bois – ELS' },
    { id: 'ba-materiaux', name: 'BA – matériaux' },
    { id: 'ba-enrobage', name: 'BA – enrobages & dispositions' },
    { id: 'ba-ancrage', name: 'BA – adhérence & ancrages' },
    { id: 'ba-poteaux', name: 'BA – poteaux & flambement' },
    { id: 'ba-flexion', name: 'BA – flexion simple' },
  ],
};
