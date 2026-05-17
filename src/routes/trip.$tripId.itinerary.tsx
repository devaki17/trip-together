import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { generateItinerary } from "@/lib/itinerary.functions";

type Search = { t?: string };

export const Route = createFileRoute("/trip/$tripId/itinerary")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    t: typeof search.t === "string" ? search.t : undefined,
  }),
  head: () => ({ meta: [{ title: "Itinerary — Whatever" }] }),
  component: ItineraryPage,
});

type Activity = {
  time: string;
  name: string;
  category: string;
  compromise?: string;
};
function ItineraryPage() {
  const { tripId } = Route.useParams();
  const genFn = useServerFn(generateItinerary);
  const q = useQuery({
    queryKey: ["itinerary", tripId],
    queryFn: () => genFn({ data: { tripId } }),
    retry: 1,
    staleTime: Infinity,
  });

  if (q.isLoading) {
    return (
      <main className="min-h-screen px-6 py-24 text-center">
        <h1 className="font-display text-4xl uppercase tracking-wide">Building your trip…</h1>
        <p className="mt-3 text-muted-foreground">Crunching everyone's preferences.</p>
      </main>
    );
  }
  if (q.isError || !q.data) {
    return (
      <main className="min-h-screen px-6 py-24 text-center">
        <p className="text-muted-foreground">
          Couldn't build the itinerary yet. Make sure everyone has submitted.
        </p>
        <Button className="mt-6" onClick={() => q.refetch()}>Try again</Button>
      </main>
    );
  }

  const itinerary = q.data.itinerary;
  const groupScore = Math.round(itinerary.satisfactionScore);
  const MEMBERS = itinerary.memberScores ?? [];
  const DAYS = (itinerary.days ?? []) as { day: number; date: string; items: Activity[] }[];

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">
          Here's your trip.
        </h1>

        {/* Satisfaction */}
        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Group satisfaction
            </h2>
            <span className="font-display text-4xl text-primary">{groupScore}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${groupScore}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {MEMBERS.map((m) => (
              <div key={m.name} className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {m.name[0]}
                </div>
                <div className="text-center text-xs">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-muted-foreground">{m.score}%</div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Scores reflect how well the plan matches each person's preferences and priorities.
          </p>
        </div>

        {/* Itinerary */}
        <div className="mt-10 space-y-6">
          {DAYS.map((d) => (
            <div key={d.day} className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-6 py-4">
                <div className="font-display text-2xl uppercase tracking-wide">
                  Day {d.day}
                </div>
                <div className="text-sm text-muted-foreground">{d.date}</div>
              </div>
              <ol className="divide-y divide-border">
                {d.items.map((a, i) => (
                  <li key={i} className="flex gap-4 px-6 py-4">
                    <div className="w-14 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                      {a.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{a.name}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground",
                          )}
                        >
                          {a.category}
                        </span>
                        {a.compromise && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
                                >
                                  Compromise
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs bg-foreground text-background">
                                {a.compromise}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="outline" className="flex-1">
            Export itinerary
          </Button>
          <Button variant="outline" className="flex-1">
            Start over
          </Button>
        </div>
      </div>
    </main>
  );
}
