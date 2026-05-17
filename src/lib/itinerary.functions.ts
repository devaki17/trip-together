import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type ActivityOut = {
  time: string;
  name: string;
  category: string;
  compromise?: string;
};
type DayOut = { day: number; date: string; items: ActivityOut[] };
type ItineraryOut = {
  satisfactionScore: number;
  memberScores: { name: string; score: number }[];
  days: DayOut[];
};

export const generateItinerary = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ tripId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: trip, error: tripErr } = await supabaseAdmin
      .from("trips")
      .select("id, name, destination, budget, depart_date, return_date, itinerary")
      .eq("id", data.tripId)
      .maybeSingle();
    if (tripErr || !trip) throw new Error(tripErr?.message ?? "Trip not found");
    if (trip.itinerary) return { itinerary: trip.itinerary as ItineraryOut };

    const [{ data: invitees }, { data: prefs }, { data: resolutions }] = await Promise.all([
      supabaseAdmin
        .from("invitees")
        .select("id, email, display_name")
        .eq("trip_id", data.tripId),
      supabaseAdmin
        .from("preferences")
        .select(
          "invitee_id, vibes, energy, morning_schedule, evening_schedule, restrictions, notes",
        )
        .eq("trip_id", data.tripId),
      supabaseAdmin
        .from("conflict_resolutions")
        .select("invitee_id, conflict_id, choice")
        .eq("trip_id", data.tripId),
    ]);

    const nameById = new Map(
      (invitees ?? []).map((i) => [
        i.id,
        i.display_name || i.email.split("@")[0],
      ]),
    );

    const submissions = (prefs ?? []).map((p) => ({
      name: nameById.get(p.invitee_id) ?? "Someone",
      vibes: p.vibes,
      energy: Number(p.energy),
      morning: p.morning_schedule,
      evening: p.evening_schedule,
      diet: p.restrictions,
      physical: p.notes,
    }));

    const conflictPicks = (resolutions ?? []).map((r) => ({
      person: nameById.get(r.invitee_id) ?? "Someone",
      conflict: r.conflict_id,
      choice: r.choice,
    }));

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You design realistic, opinionated group trip itineraries for friend groups travelling to ${trip.destination}. You ALWAYS respond with a single valid JSON object matching the requested schema and nothing else.`;

    const userPrompt = `Trip: ${trip.name}
Destination: ${trip.destination}
Budget per person: ${trip.budget}
Dates: ${trip.depart_date ?? "?"} to ${trip.return_date ?? "?"}

Members and preferences:
${submissions
  .map(
    (s) =>
      `- ${s.name}: vibes=${s.vibes.join(",") || "none"}, energy=${s.energy.toFixed(1)}/2, morning=${s.morning ?? "?"}, evening=${s.evening ?? "?"}, diet=${s.diet ?? "none"}, physical=${s.physical ?? "none"}`,
  )
  .join("\n")}

Conflict resolutions (each person assigned Strong/Medium/Low to conflicts):
${conflictPicks.map((r) => `- ${r.person}: ${r.conflict} = ${r.choice}`).join("\n") || "- (none recorded)"}

Produce a 3-day itinerary with 4 activities per day. Resolve preference conflicts by weighting against each person's Strong/Medium/Low priority on that conflict. Flag activities chosen as compromises with a short compromise note naming the conflict and how it was resolved.

Respond with ONLY a JSON object of shape:
{
  "satisfactionScore": number 0-100,
  "memberScores": [{ "name": string, "score": number 0-100 }],
  "days": [
    { "day": 1, "date": "Thu, Jun 5", "items": [
      { "time": "9:00", "name": string, "category": "Food"|"Culture"|"Nature"|"Nightlife"|"Adventure"|"Wellness"|"Shopping"|"Relax", "compromise": string | null }
    ]}
  ]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, txt);
      throw new Error(`AI request failed (${aiRes.status})`);
    }

    const aiJson = (await aiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = aiJson.choices?.[0]?.message?.content ?? "";
    const cleaned = content
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    let itinerary: ItineraryOut;
    try {
      itinerary = JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("AI returned invalid JSON");
      itinerary = JSON.parse(cleaned.slice(start, end + 1));
    }

    // Normalize: ensure compromise is string|undefined
    itinerary.days = (itinerary.days ?? []).map((d) => ({
      ...d,
      items: (d.items ?? []).map((it) => ({
        time: it.time,
        name: it.name,
        category: it.category,
        compromise: it.compromise || undefined,
      })),
    }));

    await supabaseAdmin
      .from("trips")
      .update({
        itinerary: itinerary as unknown as never,
        status: "finalized",
      })
      .eq("id", data.tripId);

    return { itinerary };
  });