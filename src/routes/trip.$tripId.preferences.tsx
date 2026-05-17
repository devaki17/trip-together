import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mountain,
  Landmark,
  UtensilsCrossed,
  Sun,
  Music,
  Trees,
  ShoppingBag,
  Sparkles,
  Heart,
  Check,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type TripSearch = {
  d?: string;
  b?: string;
  s?: string;
  e?: string;
  o?: string;
};

export const Route = createFileRoute("/trip/$tripId/preferences")({
  validateSearch: (search: Record<string, unknown>): TripSearch => ({
    d: typeof search.d === "string" ? search.d : undefined,
    b: typeof search.b === "string" ? search.b : undefined,
    s: typeof search.s === "string" ? search.s : undefined,
    e: typeof search.e === "string" ? search.e : undefined,
    o: typeof search.o === "string" ? search.o : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your trip preferences — Whatever" },
      { name: "description", content: "Tell the group what you're up for on this trip." },
    ],
  }),
  component: PreferencesPage,
});

const VIBES = [
  { id: "adventure", label: "Adventure", Icon: Mountain },
  { id: "culture", label: "Culture", Icon: Landmark },
  { id: "food", label: "Food & Drink", Icon: UtensilsCrossed },
  { id: "relax", label: "Relaxation", Icon: Sun },
  { id: "nightlife", label: "Nightlife", Icon: Music },
  { id: "nature", label: "Nature & Outdoors", Icon: Trees },
  { id: "shopping", label: "Shopping", Icon: ShoppingBag },
  { id: "wellness", label: "Wellness", Icon: Sparkles },
] as const;

const ENERGY_LABELS = ["Chill", "Balanced", "Full throttle"] as const;
const MORNING = [
  { id: "early", label: "Early bird (8am or earlier)" },
  { id: "mid", label: "Mid-morning (9–10am)" },
  { id: "late", label: "Late start (11am+)" },
];
const EVENING = [
  { id: "early", label: "Wrap up early (by 9pm)" },
  { id: "flex", label: "Flexible (10–midnight)" },
  { id: "owl", label: "Night owl (past midnight)" },
];

const BUDGET_LABEL: Record<string, string> = {
  "under-500": "Under $500",
  "500-1000": "$500–$1,000",
  "1000-2500": "$1,000–$2,500",
  "2500-plus": "$2,500+",
};

function PreferencesPage() {
  const search = Route.useSearch();
  const [vibes, setVibes] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number>(1);
  const [morning, setMorning] = useState<string>("");
  const [evening, setEvening] = useState<string>("");
  const [diet, setDiet] = useState("");
  const [physical, setPhysical] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleVibe = (id: string) => {
    if (vibes.includes(id)) {
      setVibes(vibes.filter((v) => v !== id));
      return;
    }
    if (vibes.length >= 2) {
      setShakeId(id);
      toast("Pick up to 2.");
      setTimeout(() => setShakeId(null), 450);
      return;
    }
    setVibes([...vibes, id]);
  };

  const onSubmit = () => setSubmitted(true);

  const dateRange =
    search.s && search.e
      ? `${formatDate(search.s)} – ${formatDate(search.e)}`
      : "Dates TBD";

  return (
    <main className="min-h-screen pb-32">
      <Toaster position="top-center" />
      {/* Context bar */}
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto max-w-2xl px-6 py-2.5 text-xs text-muted-foreground sm:text-sm">
          <span className="text-foreground font-medium">
            {search.d ?? "Destination TBD"}
          </span>
          <span className="mx-2">·</span>
          <span>{dateRange}</span>
          <span className="mx-2">·</span>
          <span>{search.b ? BUDGET_LABEL[search.b] ?? "Budget TBD" : "Budget TBD"}</span>
          <span className="mx-2">·</span>
          <span>Organized by {search.o ?? "your friend"}</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="font-display text-5xl sm:text-6xl uppercase tracking-wide">
          What's the vibe?
        </h1>

        {/* Section 1 — Vibes */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold">What's your vibe? Pick up to 2.</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {VIBES.map(({ id, label, Icon }) => {
              const selected = vibes.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleVibe(id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 px-4 py-4 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-primary/40",
                    shakeId === id && "animate-shake",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2 — Energy */}
        <section className="mt-14">
          <h2 className="text-lg font-semibold">How packed do you want each day?</h2>
          <div className="mt-8 px-2">
            <Slider
              value={[energy]}
              onValueChange={(v) => setEnergy(v[0])}
              min={0}
              max={2}
              step={1}
              className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:rounded-full [&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary [&_[role=slider]]:shadow-md"
            />
            <div className="mt-4 flex justify-between text-xs">
              {ENERGY_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    i === energy
                      ? "font-semibold text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <Heart className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium">{ENERGY_LABELS[energy]}</span>
            </div>
          </div>
        </section>

        {/* Section 3 — Schedule */}
        <section className="mt-14 space-y-8">
          <PillGroup
            label="Morning start"
            options={MORNING}
            value={morning}
            onChange={setMorning}
          />
          <PillGroup
            label="Evening end"
            options={EVENING}
            value={evening}
            onChange={setEvening}
          />
        </section>

        {/* Section 4 — Restrictions */}
        <section className="mt-14 space-y-6">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">Dietary</h2>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Textarea
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="Any dietary restrictions or preferences? (e.g., vegetarian, no shellfish, halal)"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">Physical</h2>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Textarea
              value={physical}
              onChange={(e) => setPhysical(e.target.value)}
              placeholder="Any physical restrictions we should plan around? (e.g., no hiking, wheelchair access needed)"
              rows={3}
            />
          </div>
        </section>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          {submitted ? (
            <div className="flex animate-[fade-in_0.3s_ease-out] items-center justify-center gap-3 py-3 text-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <span className="text-sm font-medium">
                You're in. We'll let you know when everyone's submitted.
              </span>
            </div>
          ) : (
            <Button
              onClick={onSubmit}
              className="h-12 w-full text-base font-semibold uppercase tracking-wide"
            >
              Submit my preferences
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}