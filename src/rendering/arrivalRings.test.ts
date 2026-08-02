import { describe, expect, it } from "vitest";
import { createRing, updateArrivalRings } from "./arrivalRings";
import type { WaveEvent } from "../simulation/types";

const material = {
  pVelocityKmS: 6.4,
  sVelocityKmS: 3.65,
  attenuation: 0.009,
  pFrequencyHz: 1.35,
  sFrequencyHz: 0.72,
};

function buildEvent(startedAtSeconds: number): WaveEvent {
  return {
    id: "test-event",
    epicenter: { xKm: 0, zKm: 0 },
    startedAtSeconds,
    magnitude: 6.8,
    material,
  };
}

describe("arrival ring scaling", () => {
  it("keeps the ring hovering at a fixed height regardless of wave radius", () => {
    const pRing = createRing(0x1d8fce);
    const sRing = createRing(0xd87a1c);

    // A large elapsed time produces a large wave radius (tens of km), which
    // previously multiplied the ring's fixed y = 1.2 hover height by the
    // radius via scale.setScalar(radius), sending it flying into the sky.
    const nowSeconds = 100;
    const event = buildEvent(0);
    updateArrivalRings(pRing, sRing, event, nowSeconds, true);

    const expectedPRadius = nowSeconds * material.pVelocityKmS;
    const expectedSRadius = nowSeconds * material.sVelocityKmS;

    expect(pRing.scale.x).toBeCloseTo(expectedPRadius);
    expect(pRing.scale.z).toBeCloseTo(expectedPRadius);
    expect(sRing.scale.x).toBeCloseTo(expectedSRadius);
    expect(sRing.scale.z).toBeCloseTo(expectedSRadius);

    // The vertical scale must stay pinned at 1 no matter how large the
    // horizontal radius grows, so the ring's authored y = 1.2 hover height
    // is preserved instead of being multiplied by the radius.
    expect(pRing.scale.y).toBe(1);
    expect(sRing.scale.y).toBe(1);

    const samplePoint = pRing.geometry.getAttribute("position");
    const localY = samplePoint.getY(0);
    const worldY = localY * pRing.scale.y + pRing.position.y;
    expect(worldY).toBeCloseTo(1.2);
  });

  it("hides both rings when there is no active event", () => {
    const pRing = createRing(0x1d8fce);
    const sRing = createRing(0xd87a1c);

    updateArrivalRings(pRing, sRing, null, 10, true);

    expect(pRing.visible).toBe(false);
    expect(sRing.visible).toBe(false);
  });
});
