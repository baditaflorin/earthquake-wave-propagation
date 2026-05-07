import type {
  Epicenter,
  FaultSegment,
  MaterialProfile,
  WaveEvent,
  Wavefield,
  WaveSample,
} from "./types";

const outputChannels = 4;

export function terrainHeightAt(xKm: number, zKm: number): number {
  const ridge = Math.sin(xKm * 0.095) * 1.6;
  const basin = Math.cos(zKm * 0.075 + xKm * 0.018) * 1.1;
  const folded = Math.sin((xKm + zKm) * 0.035) * 0.8;
  return ridge + basin + folded;
}

export function distanceKm(a: Epicenter, b: Epicenter): number {
  return Math.hypot(a.xKm - b.xKm, a.zKm - b.zKm);
}

export function rickerWavelet(tauSeconds: number, frequencyHz: number): number {
  const scaled = Math.PI * frequencyHz * tauSeconds;
  const squared = scaled * scaled;
  return (1 - 2 * squared) * Math.exp(-squared);
}

export function sampleWaveAt(
  point: Epicenter,
  event: WaveEvent | null,
  nowSeconds: number,
): WaveSample {
  if (!event) {
    return {
      height: 0,
      pIntensity: 0,
      sIntensity: 0,
      pArrivalSeconds: Number.POSITIVE_INFINITY,
      sArrivalSeconds: Number.POSITIVE_INFINITY,
    };
  }

  return sampleMaterialWave(
    point,
    event.epicenter,
    event.material,
    event.magnitude,
    nowSeconds - event.startedAtSeconds,
  );
}

export function sampleMaterialWave(
  point: Epicenter,
  epicenter: Epicenter,
  material: MaterialProfile,
  magnitude: number,
  elapsedSeconds: number,
): WaveSample {
  const distance = Math.max(0.05, distanceKm(point, epicenter));
  const pArrivalSeconds = distance / material.pVelocityKmS;
  const sArrivalSeconds = distance / material.sVelocityKmS;
  const attenuation = Math.exp(-distance * material.attenuation);
  const sourceScale = Math.max(0.4, magnitude - 4.8);

  const pPulse = rickerWavelet(
    elapsedSeconds - pArrivalSeconds,
    material.pFrequencyHz,
  );
  const sPulse = rickerWavelet(
    elapsedSeconds - sArrivalSeconds,
    material.sFrequencyHz,
  );
  const pIntensity = Math.min(
    1,
    Math.abs(pPulse) * attenuation * sourceScale * 0.6,
  );
  const sIntensity = Math.min(
    1,
    Math.abs(sPulse) * attenuation * sourceScale * 0.8,
  );

  return {
    height: (pPulse * 1.7 + sPulse * 2.5) * attenuation * sourceScale,
    pIntensity,
    sIntensity,
    pArrivalSeconds,
    sArrivalSeconds,
  };
}

export function buildCpuWavefield(
  gridSize: number,
  worldSizeKm: number,
  event: WaveEvent | null,
  nowSeconds: number,
): Wavefield {
  const values = new Float32Array(gridSize * gridSize * outputChannels);
  const half = worldSizeKm / 2;
  const denominator = gridSize - 1;

  for (let row = 0; row < gridSize; row += 1) {
    const zKm = (row / denominator) * worldSizeKm - half;

    for (let col = 0; col < gridSize; col += 1) {
      const xKm = (col / denominator) * worldSizeKm - half;
      const sample = sampleWaveAt({ xKm, zKm }, event, nowSeconds);
      const index = (row * gridSize + col) * outputChannels;

      values[index] = terrainHeightAt(xKm, zKm) + sample.height;
      values[index + 1] = sample.pIntensity;
      values[index + 2] = sample.sIntensity;
      values[index + 3] = terrainHeightAt(xKm, zKm);
    }
  }

  return {
    mode: "cpu",
    gridSize,
    worldSizeKm,
    values,
  };
}

export function nearestPointOnSegment(
  point: Epicenter,
  segment: FaultSegment,
): Epicenter {
  const [x1, z1] = segment.start;
  const [x2, z2] = segment.end;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lengthSquared = dx * dx + dz * dz;

  if (lengthSquared === 0) {
    return { xKm: x1, zKm: z1 };
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.xKm - x1) * dx + (point.zKm - z1) * dz) / lengthSquared,
    ),
  );
  return {
    xKm: x1 + t * dx,
    zKm: z1 + t * dz,
  };
}

export function distanceToFaultKm(
  point: Epicenter,
  segment: FaultSegment,
): number {
  return distanceKm(point, nearestPointOnSegment(point, segment));
}

export function formatArrival(seconds: number): string {
  if (!Number.isFinite(seconds)) {
    return "--";
  }

  return `${seconds.toFixed(1)}s`;
}
