import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';

/** Réglages persistés dans IndexedDB, avec leurs valeurs par défaut. */
export const DEFAULT_SETTINGS = {
  examDate: '' as string, // AAAA-MM-JJ
  scoring: { right: 2, wrong: -1, blank: 0 },
  numericTolerancePct: 2,
  examDurationMin: 90,
  examIncludeConcrete: true,
  apiKey: '' as string,
  apiModel: 'claude-sonnet-5-5',
  lastBackupAt: 0 as number,
};
export type SettingsShape = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof SettingsShape;

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingsShape[K]> {
  const row = await db.settings.get(key);
  return (row?.value as SettingsShape[K] | undefined) ?? DEFAULT_SETTINGS[key];
}

export function setSetting<K extends SettingKey>(key: K, value: SettingsShape[K]) {
  return db.settings.put({ key, value });
}

/** Hook réactif : se met à jour dès que la valeur change en base. */
export function useSetting<K extends SettingKey>(key: K): SettingsShape[K] {
  const v = useLiveQuery(() => db.settings.get(key), [key]);
  return (v?.value as SettingsShape[K] | undefined) ?? DEFAULT_SETTINGS[key];
}
