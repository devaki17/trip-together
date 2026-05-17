import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Globe, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createTrip } from "@/lib/trips.functions";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Plan a trip together — Whatever" },
      {
        name: "description",
        content: "Create a group trip where every friend weighs in on the plan.",
      },
    ],
  }),
  component: CreateTripPage,
});

const MAX_INVITES = 9;

function CreateTripPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [depart, setDepart] = useState<Date | undefined>();
  const [ret, setRet] = useState<Date | undefined>();
  const [invites, setInvites] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const createTripFn = useServerFn(createTrip);

  const addInvite = () => {
    if (invites.length < MAX_INVITES) setInvites([...invites, ""]);
  };
  const updateInvite = (i: number, v: string) => {
    setInvites(invites.map((e, idx) => (idx === i ? v : e)));
  };
  const removeInvite = (i: number) => {
    setInvites(invites.length === 1 ? [""] : invites.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await createTripFn({
        data: {
          name,
          destination,
          budget,
          departDate: depart ? depart.toISOString().slice(0, 10) : null,
          returnDate: ret ? ret.toISOString().slice(0, 10) : null,
          organizerEmail,
          inviteeEmails: invites.map((e) => e.trim()).filter(Boolean),
        },
      });

      // Store invite links locally so organizer can copy them on the next screen.
      try {
        localStorage.setItem(
          `whatever:trip:${res.tripId}:invites`,
          JSON.stringify(res.invites),
        );
      } catch {
        // ignore quota / private mode errors
      }

      navigate({
        to: "/trip/$tripId/preferences",
        params: { tripId: res.tripId },
        search: { t: res.organizerToken },
      });
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : "Couldn't create trip");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16 sm:py-24">
      <Toaster position="top-center" />
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-12 text-center">
          <h1 className="font-display text-5xl sm:text-6xl uppercase tracking-wide text-foreground">
            Plan a trip together.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            You set it up. Everyone weighs in.
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your email</Label>
            <Input
              id="email"
              type="email"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination city</Label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Lisbon"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total budget per person</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-500">Under $500</SelectItem>
                <SelectItem value="500-1000">$500 – $1,000</SelectItem>
                <SelectItem value="1000-2500">$1,000 – $2,500</SelectItem>
                <SelectItem value="2500-plus">$2,500+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateField label="Departure" value={depart} onChange={setDepart} />
            <DateField label="Return" value={ret} onChange={setRet} minDate={depart} />
          </div>

          <div className="space-y-3">
            <Label>Invite friends</Label>
            <div className="space-y-2">
              {invites.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateInvite(i, e.target.value)}
                    placeholder="friend@email.com"
                  />
                  {(invites.length > 1 || email) && (
                    <button
                      type="button"
                      onClick={() => removeInvite(i)}
                      className="rounded-md p-2 text-muted-foreground hover:text-foreground"
                      aria-label="Remove invite"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {invites.length < MAX_INVITES && (
              <button
                type="button"
                onClick={addInvite}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Add another
              </button>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full text-base font-semibold uppercase tracking-wide"
            >
              {submitting ? "Creating…" : "Create trip & send invites"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Each person you invite will get a link to add their preferences.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

function DateField({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  minDate?: Date;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(d) => (minDate ? d < minDate : false)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}