import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { setSetting, useSetting } from '@/lib/settings';
import { exportData, importData, parseBackup, resetHistory, saveFile, type Backup } from '@/lib/backup';
import { fmtDate } from '@/lib/format';
import { fmtSize } from '@/lib/documents';

/** Exporter / importer toutes mes données. */
export function BackupSection() {
  const last = useSetting('lastBackupAt');
  const docBytes = useLiveQuery(async () => (await db.documents.toArray()).reduce((s, d) => s + d.blob.size, 0), []);
  const [withDocs, setWithDocs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [pending, setPending] = useState<Backup | null>(null);

  const doExport = async () => {
    setBusy(true); setMsg('');
    try {
      const b = await exportData({ withDocuments: withDocs, appVersion: __APP_VERSION__ });
      const day = new Date().toISOString().slice(0, 10);
      const r = await saveFile(`reviz-sauvegarde-${day}.json`, JSON.stringify(b));
      if (r !== 'cancelled') {
        await setSetting('lastBackupAt', Date.now());
        setMsg(r === 'shared' ? 'Sauvegarde prête ✔ (choisis « Enregistrer dans Fichiers »).' : 'Fichier de sauvegarde téléchargé ✔');
      }
    } catch (e) {
      setMsg(`Export impossible : ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setMsg('');
    try {
      setPending(parseBackup(await f.text()));
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const restore = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    if (mode === 'replace' && !confirm('Remplacer : ton historique, tes matières perso et tes documents actuels seront effacés puis remplacés par la sauvegarde. Continuer ?')) return;
    setBusy(true);
    try {
      const r = await importData(pending, mode);
      setMsg(`Restauré ✔ ${r.subjects} matière(s) perso, ${r.questions} question(s) perso, ${r.attempts} tentative(s), ${r.documents} document(s)${r.skipped ? ` · ${r.skipped} élément(s) illisible(s) ignoré(s)` : ''}.`);
      setPending(null);
    } catch (e) {
      setMsg(`Restauration impossible : ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="sauvegarde" className="card space-y-3 p-4" aria-labelledby="bk-h">
      <h2 id="bk-h" className="font-semibold">Sauvegarde</h2>
      <p className="text-xs text-muted">
        Tout est stocké sur ce téléphone. Si tu supprimes l’appli de l’écran d’accueil, iOS efface aussi ses données : exporte régulièrement.
        Dernière sauvegarde : <b className="text-ink">{last ? fmtDate(last) : 'jamais'}</b>.
      </p>
      <label className="flex min-h-[44px] items-center justify-between gap-3">
        <span className="text-sm">Inclure les fichiers des documents{docBytes ? <span className="text-muted"> ({fmtSize(docBytes)})</span> : null}</span>
        <input type="checkbox" className="h-6 w-6 accent-[rgb(var(--c-steel))]" checked={withDocs} onChange={(e) => setWithDocs(e.target.checked)} />
      </label>
      <div className="flex gap-2">
        <button type="button" className="btn-primary flex-1" disabled={busy} onClick={doExport}>💾 Exporter</button>
        <label className={`btn-ghost flex-1 cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          📂 Importer
          <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </div>
      {pending && (
        <div className="space-y-2 rounded-xl bg-surface2 p-3 text-sm">
          <p>
            Sauvegarde du <b>{fmtDate(pending.exportedAt)}</b> : {pending.tables.attempts.length} tentative(s), {pending.tables.subjects.filter((s) => !s.builtIn).length} matière(s) perso,{' '}
            {pending.tables.questions.length} question(s) perso, {pending.tables.documents.filter((d) => d.data).length} fichier(s).
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1" disabled={busy} onClick={() => restore('merge')}>Fusionner</button>
            <button type="button" className="btn-ghost flex-1" disabled={busy} onClick={() => restore('replace')}>Remplacer</button>
          </div>
          <p className="text-xs text-muted">Fusionner ajoute ce qui manque sans rien effacer. Remplacer repart de la sauvegarde. STAB 1 reste dans les deux cas.</p>
          <button type="button" className="text-xs text-muted underline" onClick={() => setPending(null)}>Annuler</button>
        </div>
      )}
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </section>
  );
}

/** Réinitialiser l'historique (tout, ou une matière). */
export function ResetSection() {
  const subjects = useLiveQuery(() => db.subjects.orderBy('name').toArray(), []);
  const [target, setTarget] = useState('all');
  const [msg, setMsg] = useState('');

  const reset = async () => {
    const name = target === 'all' ? 'toutes les matières' : subjects?.find((s) => s.id === target)?.name;
    if (!confirm(`Effacer l’historique de ${name} (tentatives, révisions, séries en cours) ? Les questions et documents restent. C’est définitif.`)) return;
    await resetHistory(target === 'all' ? null : target);
    setMsg('Historique effacé.');
  };

  return (
    <section className="card space-y-3 p-4" aria-labelledby="rs-h">
      <h2 id="rs-h" className="font-semibold">Réinitialiser l’historique</h2>
      <div className="flex gap-2">
        <select className="field min-w-0 flex-1" aria-label="Matière à réinitialiser" value={target} onChange={(e) => { setTarget(e.target.value); setMsg(''); }}>
          <option value="all">Toutes les matières</option>
          {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="button" className="btn-ghost shrink-0 text-ko" onClick={reset} aria-label="Effacer l’historique">Effacer</button>
      </div>
      <p className="text-xs text-muted">Pour supprimer une matière perso entière, ouvre-la puis « Modifier la matière ».</p>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </section>
  );
}
