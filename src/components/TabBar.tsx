import { NavLink } from 'react-router-dom';
import { BooksIcon, ChartIcon, GearIcon, HomeIcon } from './Icons';

const tabs = [
  { to: '/', label: 'Accueil', Icon: HomeIcon, end: true },
  { to: '/matieres', label: 'Matières', Icon: BooksIcon, end: false },
  { to: '/historique', label: 'Historique', Icon: ChartIcon, end: false },
  { to: '/reglages', label: 'Réglages', Icon: GearIcon, end: false },
];

/** Barre d'onglets façon iOS, collée en bas avec la safe area (barre d'accueil de l'iPhone). */
export function TabBar() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-safe-b backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-xl">
        {tabs.map(({ to, label, Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  isActive ? 'text-steel' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-6 w-6" />
                  <span aria-current={isActive ? 'page' : undefined}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
