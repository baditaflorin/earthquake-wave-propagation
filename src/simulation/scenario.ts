import type { SeismicScenario } from "./types";

// Material values are typical literature ranges for the named tectonic setting:
//
// Continental crust (Cascadia, San Andreas regional): Vp ~ 6.0-6.5 km/s,
//   Vs ~ 3.5-3.8 km/s, Q ~ 100-300.
// Sedimentary basin (Bay Area, Salt Lake basin): Vp ~ 2.5-3.5, Vs ~ 1.0-1.5,
//   strong attenuation and low corner frequency from low Q.
// Oceanic subduction interface (Tohoku, Sumatra): Vp ~ 7.5, Vs ~ 4.3,
//   deep-source low corner frequency (~0.3-0.6 Hz from the long rupture).
// Shallow volcanic crust (Eyjafjallajökull, Mount St. Helens swarms):
//   Vp ~ 5.5, Vs ~ 3.1, narrow band high-frequency tremor (~3-6 Hz).
//
// References: USGS National Seismic Hazard Maps regional velocity models;
// Stein & Wysession (2003), An Introduction to Seismology, Earthquakes,
// and Earth Structure, table 3.1; Aki & Richards (2002) Quantitative
// Seismology, chapter 5 (attenuation).
export const cascadiaMicroScenario: SeismicScenario = {
  id: "cascadia-micro",
  name: "Cascadia subduction (teaching terrain)",
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

export const sanAndreasBayScenario: SeismicScenario = {
  id: "san-andreas-bay",
  name: "San Andreas (Bay Area, sediment basin)",
  worldSizeKm: 100,
  gridSize: 96,
  defaultMagnitude: 6.4,
  material: {
    // Bay Area sediment fill slows Vs to ~1.0-1.5 km/s; here we average a
    // mixed sediment-and-crust column so the wavefront sweeps faster than a
    // pure basin but slower than the Cascadia crust.
    pVelocityKmS: 4.2,
    sVelocityKmS: 2.1,
    attenuation: 0.018,
    pFrequencyHz: 1.1,
    sFrequencyHz: 0.6,
  },
  faults: [
    {
      id: "hayward",
      name: "Hayward fault",
      start: [-30, -42],
      end: [22, 36],
    },
    {
      id: "calaveras",
      name: "Calaveras fault",
      start: [-12, -38],
      end: [44, 28],
    },
    {
      id: "san-andreas-peninsula",
      name: "San Andreas (peninsula)",
      start: [-48, -10],
      end: [40, 44],
    },
  ],
};

export const tohokuSubductionScenario: SeismicScenario = {
  id: "tohoku-subduction",
  name: "Tohoku-class subduction megathrust",
  worldSizeKm: 220,
  gridSize: 96,
  defaultMagnitude: 8.6,
  material: {
    pVelocityKmS: 7.5,
    sVelocityKmS: 4.3,
    attenuation: 0.005,
    // Long-rupture megathrusts emit dominant energy below 1 Hz; resampled
    // here so a single Ricker wavelet stands in for the long source duration.
    pFrequencyHz: 0.55,
    sFrequencyHz: 0.3,
  },
  faults: [
    {
      id: "subduction-interface",
      name: "Subduction interface",
      start: [-90, -20],
      end: [90, 30],
    },
  ],
};

export const volcanicSwarmScenario: SeismicScenario = {
  id: "volcanic-swarm",
  name: "Volcanic swarm (shallow, narrow band)",
  worldSizeKm: 40,
  gridSize: 96,
  defaultMagnitude: 4.2,
  material: {
    pVelocityKmS: 5.5,
    sVelocityKmS: 3.1,
    attenuation: 0.03,
    // Shallow volcanic tremor concentrates energy at high frequency.
    pFrequencyHz: 4.5,
    sFrequencyHz: 2.4,
  },
  faults: [
    {
      id: "summit-vent",
      name: "Summit vent",
      start: [-6, -4],
      end: [4, 6],
    },
    {
      id: "flank-fissure",
      name: "Flank fissure",
      start: [-14, 4],
      end: [8, -12],
    },
  ],
};

export const seismicScenarios: readonly SeismicScenario[] = [
  cascadiaMicroScenario,
  sanAndreasBayScenario,
  tohokuSubductionScenario,
  volcanicSwarmScenario,
];

export function getScenarioById(id: string): SeismicScenario {
  return seismicScenarios.find((s) => s.id === id) ?? cascadiaMicroScenario;
}

export const seismometer = {
  xKm: 42,
  zKm: -36,
} as const;
