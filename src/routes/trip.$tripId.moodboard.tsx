import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitMoodboard } from "@/lib/trips.functions";

type Search = { t?: string };

export const Route = createFileRoute("/trip/$tripId/moodboard")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    t: typeof search.t === "string" ? search.t : undefined,
  }),
  head: () => ({ meta: [{ title: "Moodboard — Whatever" }] }),
  component: MoodboardPage,
});

const CARDS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  src: `https://picsum.photos/seed/whatever-${i + 1}/400/400`,
}));

function MoodboardPage() {
  const { tripId } = Route.useParams();
  const { t: token } = Route.useSearch();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitFn = useServerFn(submitMoodboard);

  const toggle = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
      return;
    }
    if (selected.length >= 5) {
      setShakeId(id);
      toast("Unselect one to choose another.");
      setTimeout(() => setShakeId(null), 450);
      return;
    }
    setSelected([...selected, id]);
  };

  const count = selected.length;
  const done = count === 5;

  const onSubmit = async () => {
    if (!token || !done || submitting) return;
    setSubmitting(true);
    try {
      await submitFn({ data: { tripId, token, photoIds: selected } });
      navigate({
        to: "/trip/$tripId/conflicts",
        params: { tripId },
        search: { t: token },
      });
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Couldn't save picks");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pb-32">
      <Toaster position="bottom-center" />
      <div
        className={cn(
          "sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur",
        )}
      >
        <div className="mx-auto max-w-4xl px-6 py-3 text-sm font-medium">
          <span className={cn(done ? "text-primary" : "text-foreground")}>
            {done ? "5 of 5 — you're done" : `${count} of 5 chosen`}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">
          Pick the photos that feel like your trip.
        </h1>
        <p className="mt-2 text-muted-foreground">Choose 5.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CARDS.map((card) => {
            const isSelected = selected.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => toggle(card.id)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-[3px] transition-all",
                  isSelected
                    ? "border-primary"
                    : "border-transparent hover:border-primary/30",
                  shakeId === card.id && "animate-shake",
                )}
              >
                <img
                  src={card.src}
                  alt=""
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover transition-all",
                    isSelected ? "brightness-110" : "brightness-95",
                  )}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Button
            disabled={!done || submitting}
            onClick={onSubmit}
            className="h-12 w-full text-base font-semibold uppercase tracking-wide"
          >
            {submitting ? "Saving…" : "Lock in my picks"}
          </Button>
        </div>
      </div>
    </main>
  );
}
