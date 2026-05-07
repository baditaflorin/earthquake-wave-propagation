import { z } from "zod";

const storageKey = "earthquake-wave-propagation/preferences/v1";

export const preferencesSchema = z.object({
  magnitude: z.number().min(5.2).max(8.4),
  attenuation: z.number().min(0.002).max(0.025),
  audioGain: z.number().min(0).max(0.9),
  exaggeration: z.number().min(0.35).max(1.8),
  showArrivalBands: z.boolean(),
});

export type SeismicPreferences = z.infer<typeof preferencesSchema>;

export const defaultPreferences: SeismicPreferences = {
  magnitude: 6.8,
  attenuation: 0.009,
  audioGain: 0.42,
  exaggeration: 0.9,
  showArrivalBands: true,
};

export function readPreferences(): SeismicPreferences {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultPreferences;
    }

    return preferencesSchema.parse({
      ...defaultPreferences,
      ...JSON.parse(raw),
    });
  } catch {
    return defaultPreferences;
  }
}

export function writePreferences(preferences: SeismicPreferences): void {
  window.localStorage.setItem(storageKey, JSON.stringify(preferences));
}
