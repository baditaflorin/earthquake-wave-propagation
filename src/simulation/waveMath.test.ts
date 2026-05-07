import { describe, expect, it } from "vitest";
import { cascadiaMicroScenario } from "./scenario";
import {
  buildCpuWavefield,
  distanceToFaultKm,
  rickerWavelet,
  sampleMaterialWave,
} from "./waveMath";

describe("wave math", () => {
  it("normalizes the source-time function around the arrival", () => {
    expect(rickerWavelet(0, 1)).toBeCloseTo(1);
    expect(Math.abs(rickerWavelet(1.5, 1))).toBeLessThan(0.01);
  });

  it("keeps P-wave arrival earlier than S-wave arrival", () => {
    const sample = sampleMaterialWave(
      { xKm: 20, zKm: 0 },
      { xKm: 0, zKm: 0 },
      cascadiaMicroScenario.material,
      6.8,
      0,
    );

    expect(sample.pArrivalSeconds).toBeLessThan(sample.sArrivalSeconds);
  });

  it("builds a four-channel grid wavefield", () => {
    const field = buildCpuWavefield(12, 60, null, 0);

    expect(field.values).toHaveLength(12 * 12 * 4);
    expect(field.values[1]).toBe(0);
    expect(field.values[2]).toBe(0);
  });

  it("finds distance to a finite fault segment", () => {
    const distance = distanceToFaultKm(
      { xKm: 0, zKm: 4 },
      cascadiaMicroScenario.faults[0],
    );

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(30);
  });
});
