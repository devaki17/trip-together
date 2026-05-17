import { cn } from "@/lib/utils";

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

export type Conflict = (typeof CONFLICTS)[number];

export function ConflictCard({
  conflict,
  children,
}: {
  conflict: Conflict;
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
