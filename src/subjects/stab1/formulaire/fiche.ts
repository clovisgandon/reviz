/** Fiche formulaire STAB 1 (consultable dans l'appli), construite à partir des tableaux relevés dans les PDF. */
import type { DataBlock } from '@/lib/types';
import {
  PSI, NEIGE_TABLE, ALTITUDE_TABLE, MU_TABLE, CPE_MURS, CPE_TOIT_PLAT, CPE_1VERSANT, FLECHES_LIMITES, KMOD, CALVI,
  CMIN_DUR, SECTIONS_ACIER, woodBlock, WOODS, IPE, HEA, HEB, UPN,
} from './tables';

const r = String.raw;
const f = (title: string, latex: string): DataBlock => ({ kind: 'formula', title, latex });
const txt = (title: string, content: string): DataBlock => ({ kind: 'text', title, content });
const cat = (title: string, list: typeof IPE): DataBlock => ({
  kind: 'table',
  title,
  columns: ['Profilé', 'G (kg/m)', 'A (cm²)', 'I_y (cm⁴)', 'W_el,y (cm³)', 'W_pl,y (cm³)', 'A_vz (cm²)', 'I_z (cm⁴)', 'W_pl,z (cm³)'],
  rows: list.map((p) => [p.name, p.G, p.A, p.Iy, p.Wely, p.Wply, p.Avz, p.Iz, p.Wplz]),
});

export type FicheSection = { id: string; title: string; blocks: DataBlock[] };

export const FICHE: FicheSection[] = [
  {
    id: 'ec0',
    title: 'Bases EC0 — combinaisons',
    blocks: [
      f('ELU fondamentale', r`1{,}35\,G_{k,sup} + 1{,}00\,G_{k,inf} + 1{,}5\,Q_{k,1} + 1{,}5\sum\psi_{0,i}Q_{k,i}`),
      f('Accidentelle', r`\sum G_{k,j} + A_d + (\psi_{1,1}\text{ ou }\psi_{2,1})Q_{k,1} + \sum\psi_{2,i}Q_{k,i}`),
      f('Sismique', r`\sum G_{k,j} + A_{Ed} + \sum\psi_{2,i}Q_{k,i}`),
      f('ELS caractéristique', r`\sum G_{k,j} + Q_{k,1} + \sum\psi_{0,i}Q_{k,i}`),
      PSI,
      txt('Durées d’utilisation de projet', '10 ans (provisoire) ; 25 ans (remplaçable, agricole) ; 50 ans (bâtiment courant) ; 100 ans (monumental, stratégique).'),
    ],
  },
  {
    id: 'neige',
    title: 'Neige (EC1-3)',
    blocks: [
      f('Charge sur la toiture', r`s = \mu_i\,C_e\,C_t\,s_k \quad\text{(accidentelle : } s_{Ad}\text{ ; accumulation : } s = \mu_i\,s_k)`),
      NEIGE_TABLE,
      ALTITUDE_TABLE,
      MU_TABLE,
      txt('Coefficients', 'C_e = 1,0 site normal ; 1,25 site protégé. C_t = 1,0 en général. Acrotère : μ2 = γh/s_k entre 0,8 et 2,0 ; γ = 2 kN/m³ ; l_s = 2h entre 5 et 15 m. Charente-Maritime = A2.'),
    ],
  },
  {
    id: 'vent',
    title: 'Vent (EC1-4)',
    blocks: [
      f('Pressions', r`q_b = \tfrac12\rho v_b^2\ (\rho = 1{,}225) \quad q_p = c_e(z)\,q_b \quad p = q_p\,(c_{pe} - c_{pi})`),
      { kind: 'table', title: 'v_b,0 par région', columns: ['Région', '1', '2', '3', '4'], rows: [['v_b,0 (m/s)', 22, 24, 26, 28]] },
      txt('Rappels', 'z = hauteur de la construction (pas l’altitude). e = min(b ; 2h). c_pi = +0,2 ou −0,3 (le plus défavorable). c_pe,10 si A ≥ 10 m², c_pe,1 si A ≤ 1 m², interpolation en log10(A) entre les deux. Catégories : 0 mer ; II rase campagne ; IIIa bocage ; IIIb zone industrielle ; IV urbain dense.'),
      CPE_MURS,
      CPE_TOIT_PLAT,
      CPE_1VERSANT,
    ],
  },
  {
    id: 'acier',
    title: 'Construction métallique (EC3)',
    blocks: [
      { kind: 'table', title: 'Nuances (t ≤ 40 mm)', columns: ['Nuance', 'f_y (MPa)', 'f_u (MPa)'], rows: [['S235', 235, 360], ['S275', 275, 430], ['S355', 355, 490], ['S450', 440, 550]] },
      txt('Constantes', 'E = 210 000 MPa ; ν = 0,3 ; ρ = 7850 kg/m³ ; γ_M0 = γ_M1 = 1,00 ; γ_M2 = 1,25 ; ε = √(235/f_y).'),
      f('Traction / compression', r`N_{pl,Rd} = \frac{A f_y}{\gamma_{M0}} \qquad N_{u,Rd} = 0{,}9\,\frac{A_{net} f_u}{\gamma_{M2}} \qquad A_{net} = bt - n\,d_0\,t`),
      f('Flexion', r`M_{pl,Rd} = \frac{W_{pl} f_y}{\gamma_{M0}}\ (\text{cl. 1-2}) \qquad M_{el,Rd} = \frac{W_{el} f_y}{\gamma_{M0}}\ (\text{cl. 3})`),
      f('Cisaillement', r`V_{pl,Rd} = A_{vz}\,\frac{f_y/\sqrt3}{\gamma_{M0}} \qquad V_{Ed} \le 0{,}5\,V_{pl,Rd} \Rightarrow \text{pas d'interaction}`),
      f('Flexion biaxiale (I, n = 0)', r`\left(\frac{M_{y,Ed}}{M_{pl,y,Rd}}\right)^2 + \frac{M_{z,Ed}}{M_{pl,z,Rd}} \le 1`),
      f('Flèche', r`w = \frac{5\,p\,L^4}{384\,E\,I}`),
      FLECHES_LIMITES,
      cat('Catalogue IPE (poly p.38-41)', IPE),
      cat('Catalogue HEA (poly p.30-35)', HEA),
      cat('Catalogue HEB (poly p.30-35)', HEB),
      cat('Catalogue UPN (poly p.36-37)', UPN),
    ],
  },
  {
    id: 'bois',
    title: 'Construction bois (EC5)',
    blocks: [
      f('Flexion', r`\sigma_{m,d} = \frac{6M}{bh^2} \le f_{m,d} = \frac{f_{m,k}\,k_{mod}\,k_h}{\gamma_M}`),
      f('Cisaillement', r`\tau_d = \frac{3V}{2bh} \le \frac{f_{v,k}\,k_{mod}\,k_{cr}}{\gamma_M},\ k_{cr} = 1`),
      f('Traction / compression //', r`\sigma_{t,0,d} \le \frac{f_{t,0,k}\,k_{mod}\,k_l}{\gamma_M} \qquad \sigma_{c,0,d} \le \frac{f_{c,0,k}\,k_{mod}}{\gamma_M}`),
      f('Flexion déviée (k_m = 0,7)', r`\frac{\sigma_y}{f_y} + k_m\frac{\sigma_z}{f_z} \le 1 \quad\text{et}\quad k_m\frac{\sigma_y}{f_y} + \frac{\sigma_z}{f_z} \le 1`),
      f('k_h', r`\text{BM}\ (h<150) : \min[(150/h)^{0,2} ; 1{,}3] \quad \text{LC}\ (h<600) : \min[(600/h)^{0,1} ; 1{,}1] \quad \text{LVL} : \min[(300/h)^{0,12} ; 1{,}2]`),
      KMOD,
      txt('Durées, γ_M, k_def', 'Permanente : poids propre. Moyen terme : exploitation, neige > 1000 m. Court terme : neige < 1000 m, entretien. Instantanée : vent, accidentel. Combinaison : k_mod de l’action la plus courte ; dimensionnante = max(charge/k_mod). γ_M : BM 1,30 ; LC 1,25 ; LVL 1,20. k_def : CS1 0,6 ; CS2 0,8 ; CS3 2,0.'),
      woodBlock(WOODS.map((w) => w.name)),
      f('Flèches', r`U_{fin,G} = (1 + k_{def})\,U_{inst,G} \qquad U_{fin,Q} = (1 + \psi_2 k_{def})\,U_{inst,Q} \qquad W_{net,fin} = U_{fin,G} + U_{fin,Q} - W_c`),
      CALVI,
    ],
  },
  {
    id: 'ba',
    title: 'Béton armé (EC2)',
    blocks: [
      f('Béton', r`f_{cd} = \frac{f_{ck}}{1{,}5}\quad f_{cm} = f_{ck} + 8\quad f_{ctm} = 0{,}3f_{ck}^{2/3}\quad f_{ctk,0,05} = 0{,}7f_{ctm}\quad E_{cm} = 22\,000\left(\frac{f_{cm}}{10}\right)^{0,3}`),
      f('Acier', r`f_{yd} = \frac{f_{yk}}{1{,}15}\ (\text{B500} : 435\ \text{MPa})\quad E_s = 200\ \text{GPa}\quad \varepsilon_{yd} = f_{yd}/E_s`),
      f('Enrobage', r`c_{nom} = \max(c_{min,b} = \varphi\ ;\ c_{min,dur}\ ;\ 10) + 10\ \text{mm} \qquad e_h \ge \max(20 ; \varphi ; d_g + 5)`),
      CMIN_DUR,
      f('Adhérence', r`f_{bd} = 2{,}25\,\eta_1\eta_2\,\frac{f_{ctk,0,05}}{1{,}5} \qquad l_{b,rqd} = \frac{\varphi}{4}\frac{f_{yd}}{f_{bd}} \qquad \eta_1 = 0{,}7\ \text{si barres hautes}`),
      f('Poteaux', r`\lambda = \frac{l_0}{i}\quad \alpha = \frac{0{,}86}{1 + (\lambda/62)^2}\quad A_{s,min} = \max\left(\frac{0{,}1N_{Ed}}{f_{yd}} ; 0{,}002A_c\right)\quad s_{cl,t} \le \min(20\varphi ; b ; 400)`),
      f('Flexion simple', r`\mu_{cu} = \frac{M_u}{bd^2f_{cd}} \le 0{,}372\ (\text{B500})\quad \beta = \frac{1 + \sqrt{1-2\mu_{cu}}}{2}\quad A_s = \frac{M_u}{\beta d f_{yd}}`),
      SECTIONS_ACIER,
    ],
  },
];
