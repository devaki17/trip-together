import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function findInviteeByToken(tripId: string, token: string) {
  const tokenHash = await sha256(token);
  const { data, error } = await supabaseAdmin
    .from("invitees")
    .select("id, trip_id, email, display_name")
    .eq("trip_id", tripId)
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Invalid invite token");
  return data;
}

// ---------------- createTrip ----------------

export const createTrip = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(100),
        destination: z.string().min(1).max(120),
        budget: z.string().min(1).max(40),
        departDate: z.string().nullable().optional(),
        returnDate: z.string().nullable().optional(),
        organizerEmail: z.string().email().max(200),
        inviteeEmails: z.array(z.string().email().max(200)).max(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: trip, error: tripErr } = await supabaseAdmin
      .from("trips")
      .insert({
        name: data.name,
        destination: data.destination,
        budget: data.budget,
        depart_date: data.departDate || null,
        return_date: data.returnDate || null,
        organizer_name: data.name,
        organizer_email: data.organizerEmail,
      })
      .select("id")
      .single();
    if (tripErr || !trip) throw new Error(tripErr?.message ?? "Failed to create trip");

    // Organizer is also an invitee so they can submit preferences themselves.
    const allEmails = Array.from(
      new Set([data.organizerEmail, ...data.inviteeEmails.filter((e) => e.trim())]),
    );

    const inviteeRows = await Promise.all(
      allEmails.map(async (email) => {
        const token = randomToken();
        const token_hash = await sha256(token);
        return {
          email,
          token,
          token_hash,
          display_name: email === data.organizerEmail ? data.name : null,
        };
      }),
    );

    const { error: invErr } = await supabaseAdmin.from("invitees").insert(
      inviteeRows.map((r) => ({
        trip_id: trip.id,
        email: r.email,
        token_hash: r.token_hash,
        display_name: r.display_name,
      })),
    );
    if (invErr) throw new Error(invErr.message);

    const organizerToken = inviteeRows.find((r) => r.email === data.organizerEmail)!.token;
    const invites = inviteeRows
      .filter((r) => r.email !== data.organizerEmail)
      .map((r) => ({ email: r.email, token: r.token }));

    return { tripId: trip.id, organizerToken, invites };
  });

// ---------------- getTrip ----------------

export const getTrip = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ tripId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: trip, error } = await supabaseAdmin
      .from("trips")
      .select(
        "id, name, destination, budget, depart_date, return_date, organizer_name, status, itinerary",
      )
      .eq("id", data.tripId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!trip) throw new Error("Trip not found");

    const { data: invitees } = await supabaseAdmin
      .from("invitees")
      .select("id, email, display_name")
      .eq("trip_id", data.tripId);

    const { count: prefCount } = await supabaseAdmin
      .from("preferences")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", data.tripId);

    return {
      trip,
      inviteeCount: invitees?.length ?? 0,
      submittedCount: prefCount ?? 0,
    };
  });

// ---------------- whoAmI (token -> invitee) ----------------

export const whoAmI = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ tripId: z.string().uuid(), token: z.string().min(10) }).parse(input),
  )
  .handler(async ({ data }) => {
    const invitee = await findInviteeByToken(data.tripId, data.token);
    return { invitee };
  });

// ---------------- submitPreferences ----------------

export const submitPreferences = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        tripId: z.string().uuid(),
        token: z.string().min(10),
        displayName: z.string().min(1).max(80),
        vibes: z.array(z.string().max(40)).max(2),
        energy: z.number().min(0).max(2),
        morningSchedule: z.string().max(40).optional(),
        eveningSchedule: z.string().max(40).optional(),
        diet: z.string().max(1000).optional(),
        physical: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const invitee = await findInviteeByToken(data.tripId, data.token);

    await supabaseAdmin
      .from("invitees")
      .update({ display_name: data.displayName, joined_at: new Date().toISOString() })
      .eq("id", invitee.id);

    const { error } = await supabaseAdmin.from("preferences").upsert(
      {
        trip_id: data.tripId,
        invitee_id: invitee.id,
        vibes: data.vibes,
        energy: data.energy,
        morning_schedule: data.morningSchedule ?? null,
        evening_schedule: data.eveningSchedule ?? null,
        restrictions: data.diet ?? null,
        notes: data.physical ?? null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "invitee_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- submitMoodboard ----------------

export const submitMoodboard = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        tripId: z.string().uuid(),
        token: z.string().min(10),
        photoIds: z.array(z.number().int().min(0).max(10000)).length(5),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const invitee = await findInviteeByToken(data.tripId, data.token);
    const { error } = await supabaseAdmin.from("moodboard_picks").upsert(
      {
        trip_id: data.tripId,
        invitee_id: invitee.id,
        photo_ids: data.photoIds,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "invitee_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- submitConflictResolutions ----------------

export const submitConflictResolutions = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        tripId: z.string().uuid(),
        token: z.string().min(10),
        resolutions: z
          .array(
            z.object({
              conflictId: z.string().min(1).max(40),
              choice: z.string().min(1).max(40),
            }),
          )
          .min(1)
          .max(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const invitee = await findInviteeByToken(data.tripId, data.token);
    const rows = data.resolutions.map((r) => ({
      trip_id: data.tripId,
      invitee_id: invitee.id,
      conflict_id: r.conflictId,
      choice: r.choice,
      submitted_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin
      .from("conflict_resolutions")
      .upsert(rows, { onConflict: "invitee_id,conflict_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- submitVote ----------------

export const submitVote = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        tripId: z.string().uuid(),
        token: z.string().min(10),
        approved: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const invitee = await findInviteeByToken(data.tripId, data.token);
    const { error } = await supabaseAdmin.from("votes").upsert(
      {
        trip_id: data.tripId,
        invitee_id: invitee.id,
        approved: data.approved,
        voted_at: new Date().toISOString(),
      },
      { onConflict: "invitee_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });