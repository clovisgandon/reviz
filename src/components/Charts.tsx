import { useState } from 'react';
import { fmt } from '@/lib/format';

/**
 * Petits graphiques SVG faits main (pas de dépendance).
 * Une seule série par graphique → pas de légende, le titre nomme la série.
 * Marques fines (ligne 2 px, points ≥ 8 px), grille discrète, info-bulle au survol / au toucher,
 * texte en couleurs de texte (jamais la couleur de la série), tableau des valeurs disponible.
 */

const W = 340;
const H = 150;
const PAD = { l: 28, r: 10, t: 12, b: 22 };

function Tooltip({ x, y, text }: { x: number; y: number; text: string }) {
  const w = Math.max(60, text.length * 6.2 + 12);
  const tx = Math.min(Math.max(x - w / 2, 0), W - w);
  const ty = Math.max(y - 30, 0);
  return (
    <g pointerEvents="none">
      <rect x={tx} y={ty} width={w} height={22} rx={6} className="fill-ink" opacity={0.92} />
      <text x={tx + w / 2} y={ty + 15} textAnchor="middle" className="fill-bg text-[11px] font-semibold">{text}</text>
    </g>
  );
}

/** Évolution d'une note /20 dans le temps (ligne + points). */
export function ScoreLine({ points, label = 'Note /20' }: { points: { x: number; y: number; current?: boolean }[]; label?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return null;
  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const sx = (x: number) => (maxX === minX ? (PAD.l + W - PAD.r) / 2 : PAD.l + ((x - minX) / (maxX - minX)) * (W - PAD.l - PAD.r));
  const sy = (y: number) => PAD.t + (1 - y / 20) * (H - PAD.t - PAD.b);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${label} : ${points.map((p) => fmt(p.y, 1)).join(', ')}`} onMouseLeave={() => setHover(null)}>
        {[0, 10, 20].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} className="stroke-line" strokeWidth={1} />
            <text x={PAD.l - 6} y={sy(v) + 4} textAnchor="end" className="fill-muted text-[10px]">{v}</text>
          </g>
        ))}
        <path d={d} fill="none" className="stroke-steel" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${new Date(p.x).toLocaleDateString('fr-FR')} : ${fmt(p.y, 1)}/20`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={14} fill="transparent" />
            <circle cx={sx(p.x)} cy={sy(p.y)} r={p.current ? 5.5 : 4} className={p.current ? 'fill-site stroke-surface' : 'fill-steel stroke-surface'} strokeWidth={2} />
          </g>
        ))}
        {hover !== null && <Tooltip x={sx(points[hover].x)} y={sy(points[hover].y)} text={`${new Date(points[hover].x).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${fmt(points[hover].y, 1)}/20`} />}
      </svg>
    </figure>
  );
}

/** Nombre de questions faites par jour (barres). */
export function DailyBars({ days, label = 'Questions par jour' }: { days: { day: string; date: Date; n: number }[]; label?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(5, ...days.map((d) => d.n));
  const bw = (W - PAD.l - PAD.r) / days.length;
  const sy = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b);
  const base = sy(0);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        {[0, Math.round(max / 2), max].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} className="stroke-line" strokeWidth={1} />
            <text x={PAD.l - 6} y={sy(v) + 4} textAnchor="end" className="fill-muted text-[10px]">{v}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = PAD.l + i * bw;
          const h = base - sy(d.n);
          const w = Math.max(2, bw - 2); // 2 px d'écart entre barres
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onClick={() => setHover(i)}>
              <rect x={x} y={PAD.t} width={bw} height={base - PAD.t} fill="transparent" />
              {d.n > 0 && (
                <path
                  // barre arrondie seulement en haut (extrémité de donnée), posée sur la ligne de base
                  d={`M${x + 1},${base} V${base - h + Math.min(4, h)} Q${x + 1},${base - h} ${x + 1 + Math.min(4, w / 2)},${base - h} H${x + 1 + w - Math.min(4, w / 2)} Q${x + 1 + w},${base - h} ${x + 1 + w},${base - h + Math.min(4, h)} V${base} Z`}
                  className={hover === i ? 'fill-site' : 'fill-steel'}
                />
              )}
            </g>
          );
        })}
        {[0, days.length - 1].map((i) => (
          <text key={i} x={PAD.l + i * bw + bw / 2} y={H - 6} textAnchor={i === 0 ? 'start' : 'end'} className="fill-muted text-[10px]">
            {days[i]?.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </text>
        ))}
        {hover !== null && <Tooltip x={PAD.l + hover * bw + bw / 2} y={sy(days[hover].n)} text={`${days[hover].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${days[hover].n} question${days[hover].n > 1 ? 's' : ''}`} />}
      </svg>
    </figure>
  );
}

/** Carte de chaleur simple : réussite par thème (une teinte, du clair au foncé, valeur écrite dans chaque case). */
export function ThemeHeat({ rows }: { rows: { name: string; ok: number; n: number }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-[2px] overflow-hidden rounded-xl sm:grid-cols-3" aria-label="Réussite par thème">
      {rows.map((r) => {
        const pct = r.n ? r.ok / r.n : null;
        // 5 marches de la même teinte (bleu acier) selon le taux de réussite ; gris si jamais travaillé
        const step = pct === null ? -1 : Math.min(4, Math.floor(pct * 5));
        const bg = step < 0 ? 'rgb(var(--c-surface2))' : `rgb(var(--c-steel) / ${[0.12, 0.28, 0.45, 0.65, 0.85][step]})`;
        const dark = step >= 3;
        return (
          <li key={r.name} className="flex min-h-[64px] flex-col justify-between p-2" style={{ background: bg }} title={`${r.name} : ${r.n ? `${r.ok}/${r.n}` : 'pas encore travaillé'}`}>
            <span className={`text-[11px] leading-tight ${dark ? 'text-white dark:text-bg' : 'text-ink'}`}>{r.name}</span>
            <span className={`tabular text-sm font-bold ${dark ? 'text-white dark:text-bg' : 'text-ink'}`}>{pct === null ? '—' : `${Math.round(pct * 100)} %`}{r.n ? <span className="font-normal opacity-80"> · {r.n}</span> : null}</span>
          </li>
        );
      })}
    </ul>
  );
}
