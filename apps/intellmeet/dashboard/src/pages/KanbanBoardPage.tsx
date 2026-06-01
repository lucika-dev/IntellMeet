import { ClipboardList } from 'lucide-react';

import { PageTransition } from '../components/PageTransition';

const columns = [
  { id: 'todo', title: 'To do' },
  { id: 'in-progress', title: 'In progress' },
  { id: 'done', title: 'Done' },
];

export const KanbanBoardPage = () => {
  return (
    <PageTransition>
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Project board
          </h1>

          <p className="mt-1 text-muted-foreground">
            Tasks will appear here when the shared tasks backend is enabled
          </p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 md:grid-cols-3">
          {columns.map((column) => (
            <section
              key={column.id}
              className="flex min-h-0 flex-col border border-border bg-card"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                <h2 className="font-semibold text-foreground">
                  {column.title}
                </h2>

                <span className="text-xs text-muted-foreground">
                  0
                </span>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-center">
                <div className="flex max-w-56 flex-col items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
                    <ClipboardList className="size-5" />
                  </div>

                  <p>
                    No tasks in this column
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};
