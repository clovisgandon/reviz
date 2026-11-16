import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Filet de sécurité : une erreur dans un écran affiche un message au lieu d'une page blanche.
 * Les données (IndexedDB) ne sont pas touchées ; `resetKey` (le chemin) referme l'erreur quand on change d'écran.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur d’affichage', error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    // Après une mise à jour, un vieux morceau de l'appli peut manquer : un rechargement suffit.
    const chunk = /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(error.message);
    return (
      <main className="mx-auto max-w-xl space-y-4 p-6 pt-[calc(32px+env(safe-area-inset-top))] text-center">
        <p className="text-4xl" aria-hidden>🧯</p>
        <h1 className="text-xl font-bold">Oups, cet écran a planté</h1>
        <p className="text-sm text-muted">
          {chunk ? 'L’appli vient sans doute d’être mise à jour : recharge-la.' : 'Tes données sont intactes. Recharge l’appli ou reviens à l’accueil.'}
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1" onClick={() => { location.hash = '#/'; this.setState({ error: null }); }}>Accueil</button>
          <button type="button" className="btn-primary flex-1" onClick={() => location.reload()}>Recharger</button>
        </div>
        <details className="text-left text-xs text-muted">
          <summary className="cursor-pointer">Détail technique</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words">{error.message}</pre>
        </details>
      </main>
    );
  }
}
