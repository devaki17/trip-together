import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export const CONFLICTS = [
  {
    id: "morning",
    title: "Morning schedule",
    desc: "3 people want early starts. 2 prefer late mornings.",
    segments: [
      { name: "Marcus", side: "a" },
      { name: "Aisha", side: "a" },
      { name: "Jordan", side: "a" },
      { name: "Priya", side: "b" },
      { name: "Sam", side: "b" },
    ],
    labelA: "Early start",
    labelB: "Late start",
  },
  {
    id: "density",
    title: "Activity density",
    desc: "2 want chill, 3 want full throttle.",
    segments: [
      { name: "Priya", side: "a" },
      { name: "Sam", side: "a" },
      { name: "Marcus", side: "b" },
      { name: "Aisha", side: "b" },
      { name: "Jordan", side: "b" },
    ],
    labelA: "Chill",
    labelB: "Full throttle",
  },
  {
    id: "dining",
    title: "Dining",
    desc: "2 vegetarian, 3 no restrictions.",
    segments: [
      { name: "Aisha", side: "a" },
      { name: "Sam", side: "a" },
      { name: "Marcus", side: "b" },
      { name: "Priya", side: "b" },
      { name: "Jordan", side: "b" },
    ],
    labelA: "Vegetarian",
    labelB: "No restrictions",
  },
] as const;

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

export function ConflictCard({
  conflict,
  children,
}: {
  conflict: (typeof CONFLICTS)[number];
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold">{conflict.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{conflict.desc}</p>

      <div className="mt-5">
        <div className="flex h-10 overflow-hidden rounded-md border border-border">
          {conflict.segments.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-1 items-center justify-center text-[11px] font-semibold",
                s.side === "a"
                  ? "bg-primary/85 text-primary-foreground"
                  : "bg-secondary text-foreground",
              )}
              title={s.name}
            >
              {initials(s.name)}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{conflict.labelA}</span>
          <span>{conflict.labelB}</span>
        </div>
      </div>

      {children}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function fmt(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
