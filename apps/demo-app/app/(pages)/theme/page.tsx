export default function ThemePage() {
  return (
    <main className="bg-background text-foreground min-h-screen p-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold">
            Wraith Themes Runtime Test
          </h1>

          <p className="text-muted-foreground mt-2">
            Dynamic tweakcn theme switching
          </p>
        </div>

        <div className="bg-card text-card-foreground border-border rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Theme Card
          </h2>

          <p className="text-muted-foreground mt-2">
            If themes switch correctly,
            this card should update live.
          </p>
        </div>

        <div className="bg-primary text-primary-foreground rounded-xl px-6 py-4">
          Primary Theme Surface
        </div>

        <div className="bg-secondary text-secondary-foreground rounded-xl px-6 py-4">
          Secondary Theme Surface
        </div>

        <div className="bg-accent text-accent-foreground rounded-xl px-6 py-4">
          Accent Theme Surface
        </div>

        <div className="border-border rounded-xl border p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Semantic Tokens
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-muted text-muted-foreground rounded-lg p-4">
              Muted Surface
            </div>

            <div className="bg-popover text-popover-foreground rounded-lg p-4">
              Popover Surface
            </div>

            <div className="bg-destructive text-destructive-foreground rounded-lg p-4">
              Destructive Surface
            </div>

            <div className="bg-sidebar text-sidebar-foreground rounded-lg p-4">
              Sidebar Surface
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}