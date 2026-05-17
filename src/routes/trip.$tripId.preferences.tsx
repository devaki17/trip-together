import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { getTrip, submitPreferences, whoAmI } from "@/lib/trips.functions";

type Search = { t?: string };

export const Route = createFileRoute("/trip/$tripId/preferences")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    t: typeof search.t === "string" ? search.t : undefined,
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
  const { tripId } = Route.useParams();
  const { t: token } = Route.useSearch();
  const navigate = useNavigate();

  const getTripFn = useServerFn(getTrip);
  const whoAmIFn = useServerFn(whoAmI);
  const submitFn = useServerFn(submitPreferences);

  const tripQ = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => getTripFn({ data: { tripId } }),
  });

  const meQ = useQuery({
    queryKey: ["me", tripId, token],
    queryFn: () => whoAmIFn({ data: { tripId, token: token! } }),
    enabled: !!token,
  });

  const [displayName, setDisplayName] = useState("");
  const [vibes, setVibes] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number>(1);
  const [morning, setMorning] = useState<string>("");
  const [evening, setEvening] = useState<string>("");
  const [diet, setDiet] = useState("");
  const [physical, setPhysical] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (meQ.data?.invitee.display_name && !displayName) {
      setDisplayName(meQ.data.invitee.display_name);
    }
  }, [meQ.data, displayName]);

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

  const onSubmit = async () => {
    if (!token) return toast("Missing invite token.");
    if (!displayName.trim()) return toast("Add your name so the group knows it's you.");
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitFn({
        data: {
          tripId,
          token,
          displayName: displayName.trim(),
          vibes,
          energy,
          morningSchedule: morning || undefined,
          eveningSchedule: evening || undefined,
          diet: diet || undefined,
          physical: physical || undefined,
        },
      });
      navigate({
        to: "/trip/$tripId/moodboard",
        params: { tripId },
        search: { t: token },
      });
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Couldn't save preferences");
      setSubmitting(false);
    }
  };

  const trip = tripQ.data?.trip;
  const dateRange =
    trip?.depart_date && trip?.return_date
      ? `${formatDate(trip.depart_date)} – ${formatDate(trip.return_date)}`
      : "Dates TBD";

  if (!token) {
    return (
      <main className="min-h-screen px-6 py-20 text-center">
        <p className="text-muted-foreground">This link is missing its invite token.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-32">
      <Toaster position="top-center" />
      <div className="border-b border-border bg-secondary/60">
        <div className="mx-auto max-w-2xl px-6 py-2.5 text-xs text-muted-foreground sm:text-sm">
          <span className="text-foreground font-medium">
            {trip?.destination ?? "…"}
          </span>
          <span className="mx-2">·</span>
          <span>{dateRange}</span>
          <span className="mx-2">·</span>
          <span>{trip ? BUDGET_LABEL[trip.budget] ?? trip.budget : "…"}</span>
          <span className="mx-2">·</span>
          <span>Organized by {trip?.organizer_name ?? "…"}</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <h1 className="font-display text-5xl sm:text-6xl uppercase tracking-wide">
          What's the vibe?
        </h1>

        <section className="mt-10 space-y-2">
          <Label htmlFor="dn">Your name</Label>
          <Input
            id="dn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="So the group knows it's you"
            maxLength={60}
          />
        </section>

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

        <section className="mt-14">
          <h2 className="text-lg font-semibold">How packed do you want each day?</h2>
          <div className="mt-8 px-2">
            <Slider
              value={[energy]}
              onValueChange={(v) => setEnergy(v[0])}
              min={0}
              max={2}
              step={0.01}
              className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:rounded-full [&_[role=slider]]:border-0 [&_[role=slider]]:bg-primary [&_[role=slider]]:shadow-md"
            />
            <div className="mt-4 flex justify-between text-xs">
              {ENERGY_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    i === Math.round(energy)
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
              <span className="font-medium">{ENERGY_LABELS[Math.round(energy)]}</span>
            </div>
          </div>
        </section>

        <section className="mt-14 space-y-8">
          <PillGroup label="Morning start" options={MORNING} value={morning} onChange={setMorning} />
          <PillGroup label="Evening end" options={EVENING} value={evening} onChange={setEvening} />
        </section>

        <section className="mt-14 space-y-6">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">Dietary</h2>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <Textarea
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="Any dietary restrictions or preferences?"
              rows={3}
              maxLength={800}
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
              placeholder="Any physical restrictions we should plan around?"
              rows={3}
              maxLength={800}
            />
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="h-12 w-full text-base font-semibold uppercase tracking-wide"
          >
            {submitting ? "Saving…" : "Submit my preferences"}
          </Button>
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