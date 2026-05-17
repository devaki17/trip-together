import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CONFLICTS, ConflictCard } from "@/lib/conflicts-data";

type ConflictSearch = {
  d?: string;
  b?: string;
  s?: string;
  e?: string;
  o?: string;
};

export const Route = createFileRoute("/trip/$tripId/conflicts")({
  validateSearch: (search: Record<string, unknown>): ConflictSearch => ({
    d: typeof search.d === "string" ? search.d : undefined,
    b: typeof search.b === "string" ? search.b : undefined,
    s: typeof search.s === "string" ? search.s : undefined,
    e: typeof search.e === "string" ? search.e : undefined,
    o: typeof search.o === "string" ? search.o : undefined,
  }),
  head: () => ({ meta: [{ title: "Conflicts — Whatever" }] }),
  component: ConflictsPage,
});

const BUDGET_LABEL: Record<string, string> = {
  "under-500": "Under $500",
  "500-1000": "$500–$1,000",
  "1000-2500": "$1,000–$2,500",
  "2500-plus": "$2,500+",
};

function ConflictsPage() {
  const { tripId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const dateRange =
    search.s && search.e ? `${fmt(search.s)} – ${fmt(search.e)}` : "Dates TBD";

  return (
    <main className="min-h-screen pb-32">
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto max-w-2xl px-6 py-2.5 text-xs text-muted-foreground sm:text-sm">
          <span className="text-foreground font-medium">{search.d ?? "Destination TBD"}</span>
          <span className="mx-2">·</span>
          <span>{dateRange}</span>
          <span className="mx-2">·</span>
          <span>{search.b ? BUDGET_LABEL[search.b] ?? "Budget TBD" : "Budget TBD"}</span>
          <span className="mx-2">·</span>
          <span>Organized by {search.o ?? "your friend"}</span>
        </div>
      </div>

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

function fmt(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
