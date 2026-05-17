import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CONFLICTS, ConflictCard } from "./trip.$tripId.conflicts";

type Weight = "Strong" | "Medium" | "Low";
const WEIGHTS: Weight[] = ["Strong", "Medium", "Low"];

type VoteSearch = {
  d?: string;
  b?: string;
  s?: string;
  e?: string;
  o?: string;
};

export const Route = createFileRoute("/trip/$tripId/vote")({
  validateSearch: (search: Record<string, unknown>): VoteSearch => ({
    d: typeof search.d === "string" ? search.d : undefined,
    b: typeof search.b === "string" ? search.b : undefined,
    s: typeof search.s === "string" ? search.s : undefined,
    e: typeof search.e === "string" ? search.e : undefined,
    o: typeof search.o === "string" ? search.o : undefined,
  }),
  head: () => ({ meta: [{ title: "Vote — Whatever" }] }),
  component: VotePage,
});

function VotePage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const [votes, setVotes] = useState<Record<string, Weight>>({});

  const usedBy = (w: Weight) =>
    Object.entries(votes).find(([, v]) => v === w)?.[0];

  const assign = (conflictId: string, w: Weight) => {
    const owner = usedBy(w);
    if (owner && owner !== conflictId) {
      const ownerTitle = CONFLICTS.find((c) => c.id === owner)?.title;
      toast(`You already used ${w} on ${ownerTitle}.`);
      return;
    }
    setVotes((prev) => {
      const next = { ...prev };
      if (next[conflictId] === w) delete next[conflictId];
      else next[conflictId] = w;
      return next;
    });
  };

  const allAssigned = Object.keys(votes).length === 3;

  return (
    <main className="min-h-screen pb-32">
      <Toaster position="bottom-center" />
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="font-display text-5xl uppercase tracking-wide sm:text-6xl">
          How much does each one matter to you?
        </h1>
        <p className="mt-3 text-muted-foreground">
          You have one Strong, one Medium, and one Low to assign. Use them wisely.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Assign each weight exactly once:
          </span>
          <span className="ml-2 inline-flex flex-wrap gap-3">
            {WEIGHTS.map((w) => {
              const used = !!usedBy(w);
              return (
                <span
                  key={w}
                  className={cn(
                    "inline-flex items-center gap-1 font-medium",
                    used ? "text-primary" : "text-foreground",
                  )}
                >
                  {w}
                  {used && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              );
            })}
          </span>
        </div>

        <div className="mt-8 space-y-5">
          {CONFLICTS.map((c) => (
            <ConflictCard key={c.id} conflict={c}>
              <div className="mt-5 flex flex-wrap gap-2">
                {WEIGHTS.map((w) => {
                  const owner = usedBy(w);
                  const selected = votes[c.id] === w;
                  const disabled = !!owner && owner !== c.id;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => assign(c.id, w)}
                      className={cn(
                        "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : disabled
                            ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                            : "border-border bg-card text-foreground hover:border-primary/40",
                      )}
                      title={
                        disabled
                          ? `You already used ${w} on ${CONFLICTS.find((cf) => cf.id === owner)?.title}.`
                          : undefined
                      }
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </ConflictCard>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Button
            disabled={!allAssigned}
            onClick={() => navigate({ to: "/trip/$tripId/itinerary", params: { tripId } })}
            className="h-12 w-full text-base font-semibold uppercase tracking-wide"
          >
            Submit my priorities
          </Button>
        </div>
      </div>
    </main>
  );
}
