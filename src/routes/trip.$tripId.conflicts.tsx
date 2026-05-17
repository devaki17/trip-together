import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CONFLICTS, ConflictCard } from "@/lib/conflicts-data";

type ConflictSearch = { t?: string };

export const Route = createFileRoute("/trip/$tripId/conflicts")({
  validateSearch: (search: Record<string, unknown>): ConflictSearch => ({
    t: typeof search.t === "string" ? search.t : undefined,
  }),
  head: () => ({ meta: [{ title: "Conflicts — Whatever" }] }),
  component: ConflictsPage,
});

function ConflictsPage() {
  const { tripId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">
          Here's where you don't agree.
        </h1>
        <p className="mt-3 text-muted-foreground">Three things to sort out as a group.</p>

        <div className="mt-10 space-y-5">
          {CONFLICTS.map((c) => (
            <ConflictCard key={c.id} conflict={c} />
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Button
            onClick={() =>
              navigate({ to: "/trip/$tripId/vote", params: { tripId }, search })
            }
            className="h-12 w-full text-base font-semibold uppercase tracking-wide"
          >
            Weigh in on each conflict
          </Button>
        </div>
      </div>
    </main>
  );
}
