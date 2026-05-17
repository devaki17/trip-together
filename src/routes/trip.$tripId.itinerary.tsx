import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trip/$tripId/itinerary")({
  head: () => ({ meta: [{ title: "Itinerary — Whatever" }] }),
  component: ItineraryPage,
});

const MEMBERS = [
  { name: "Marcus", score: 91 },
  { name: "Priya", score: 78 },
  { name: "Aisha", score: 88 },
  { name: "Jordan", score: 82 },
  { name: "Sam", score: 81 },
];

type Activity = {
  time: string;
  name: string;
  category: string;
  compromise?: string;
};

const DAYS: { day: number; date: string; items: Activity[] }[] = [
  {
    day: 1,
    date: "Thu, Jun 5",
    items: [
      {
        time: "9:00",
        name: "Breakfast at Café Janis",
        category: "Food",
        compromise:
          "Starting at 9am — between Marcus's early start and Priya's late start preference.",
      },
      { time: "10:30", name: "Walk through Alfama", category: "Culture" },
      { time: "13:00", name: "Lunch at Time Out Market", category: "Food" },
      { time: "20:30", name: "Fado night in Bairro Alto", category: "Nightlife" },
    ],
  },
  {
    day: 2,
    date: "Fri, Jun 6",
    items: [
      { time: "9:30", name: "Jerónimos Monastery", category: "Culture" },
      { time: "12:00", name: "Pastéis de Belém", category: "Food" },
      {
        time: "15:00",
        name: "LX Factory — light browsing",
        category: "Culture",
        compromise: "Lighter afternoon to balance the chill vs. full-throttle split.",
      },
      { time: "19:30", name: "Dinner at Prado", category: "Food" },
    ],
  },
  {
    day: 3,
    date: "Sat, Jun 7",
    items: [
      { time: "9:00", name: "Day trip to Sintra", category: "Culture" },
      {
        time: "13:00",
        name: "Lunch at Tascantiga (veg options)",
        category: "Food",
        compromise: "Vegetarian-friendly venue picked for Aisha and Sam.",
      },
      { time: "18:00", name: "Sunset at Miradouro da Graça", category: "Nature" },
      { time: "21:00", name: "Late dinner at Cervejaria Ramiro", category: "Food" },
    ],
  },
];

const groupScore = 84;

function ItineraryPage() {
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

          <div className="mt-6 grid grid-cols-5 gap-3">
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
