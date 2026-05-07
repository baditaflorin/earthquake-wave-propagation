export type WaveMode = "cpu" | "webgpu";

export type FaultSegment = {
  readonly id: string;
  readonly name: string;
  readonly start: readonly [number, number];
  readonly end: readonly [number, number];
};

export type MaterialProfile = {
  readonly pVelocityKmS: number;
  readonly sVelocityKmS: number;
  readonly attenuation: number;
  readonly pFrequencyHz: number;
  readonly sFrequencyHz: number;
};

export type SeismicScenario = {
  readonly id: string;
  readonly name: string;
  readonly worldSizeKm: number;
  readonly gridSize: number;
  readonly defaultMagnitude: number;
  readonly material: MaterialProfile;
  readonly faults: readonly FaultSegment[];
};

export type Epicenter = {
  readonly xKm: number;
  readonly zKm: number;
};

export type WaveEvent = {
  readonly id: string;
  readonly epicenter: Epicenter;
  readonly startedAtSeconds: number;
  readonly magnitude: number;
  readonly material: MaterialProfile;
};

export type Wavefield = {
  readonly mode: WaveMode;
  readonly gridSize: number;
  readonly worldSizeKm: number;
  readonly values: Float32Array;
};

export type WaveKernel = {
  readonly mode: WaveMode;
  compute(event: WaveEvent | null, nowSeconds: number): Promise<Wavefield>;
  dispose(): void;
};

export type WaveSample = {
  readonly height: number;
  readonly pIntensity: number;
  readonly sIntensity: number;
  readonly pArrivalSeconds: number;
  readonly sArrivalSeconds: number;
};
