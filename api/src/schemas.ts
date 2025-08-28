import { z } from "zod";

export const PlanInput = z.object({
  intent: z.literal("route"),
  start: z.object({ lat: z.number(), lng: z.number() }),
  area: z.string().optional(),
  waypoints: z.array(z.object({ category: z.string() })),
  constraints: z.object({
    crowd: z.enum(["low","any"]).optional(),
    mood: z.string().optional(),
    when: z.string().optional(),
    max_walk_km: z.number().optional()
  }).optional()
});

export type PlanInput = z.infer<typeof PlanInput>;