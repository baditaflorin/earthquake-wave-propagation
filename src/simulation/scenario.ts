import type { SeismicScenario } from "./types";

export const cascadiaMicroScenario: SeismicScenario = {
  id: "cascadia-micro",
  name: "Cascadia teaching terrain",
  worldSizeKm: 120,
  gridSize: 96,
  defaultMagnitude: 6.8,
  material: {
    pVelocityKmS: 6.4,
    sVelocityKmS: 3.65,
    attenuation: 0.009,
    pFrequencyHz: 1.35,
    sFrequencyHz: 0.72,
  },
  faults: [
    {
      id: "northwest-thrust",
      name: "Northwest thrust",
      start: [-44, -38],
      end: [38, 32],
    },
    {
      id: "coastal-splay",
      name: "Coastal splay",
      start: [-54, 24],
      end: [12, 48],
    },
  ],
};

export const seismometer = {
  xKm: 42,
  zKm: -36,
} as const;
