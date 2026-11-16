import type { AnyGenerator } from '@/features/table/types';
import { ACTIONS_GENERATORS } from './actions';
import { METAL_GENERATORS } from './metal';
import { BOIS_GENERATORS } from './bois';
import { BA_GENERATORS } from './ba';

/** Générateurs du contrôle sur table de STAB 1 (une matière sans générateurs n'a pas ce mode). */
export const STAB1_GENERATORS: AnyGenerator[] = [...ACTIONS_GENERATORS, ...METAL_GENERATORS, ...BOIS_GENERATORS, ...BA_GENERATORS];

/** Registre par matière : pour en ajouter, créer subjects/<id>/generators et l'enregistrer ici. */
export const GENERATORS_BY_SUBJECT: Record<string, AnyGenerator[]> = { stab1: STAB1_GENERATORS };

export function findGenerator(id: string): AnyGenerator | undefined {
  return Object.values(GENERATORS_BY_SUBJECT).flat().find((g) => g.id === id);
}
