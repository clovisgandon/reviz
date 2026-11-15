import type { Question } from '@/lib/types';
import { Rich } from './Rich';
import { DataPanel } from './DataBlocks';

/** Énoncé + figure + bloc Données (toujours affiché quand la question en a besoin). */
export function QuestionBody({ q }: { q: Question }) {
  return (
    <div className="space-y-3">
      <div className="text-[17px]">
        <Rich text={q.prompt} />
      </div>
      {q.figure && (
        <figure className="card overflow-hidden p-2">
          {q.figure.kind === 'svg' ? (
            <div role="img" aria-label={q.figure.alt} className="[&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: q.figure.content }} />
          ) : (
            <img src={q.figure.content} alt={q.figure.alt} className="w-full" />
          )}
        </figure>
      )}
      {q.data && q.data.length > 0 && <DataPanel blocks={q.data} />}
    </div>
  );
}
