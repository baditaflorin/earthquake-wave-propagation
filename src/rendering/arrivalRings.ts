import * as THREE from "three";
import type { WaveEvent } from "../simulation/types";

export function createRing(color: number): THREE.Line {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 160; i += 1) {
    const angle = (i / 160) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle), 1.2, Math.sin(angle)));
  }

  const ring = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }),
  );
  ring.visible = false;
  return ring;
}

export function updateArrivalRings(
  pRing: THREE.Line,
  sRing: THREE.Line,
  event: WaveEvent | null,
  nowSeconds: number,
  visible: boolean,
) {
  if (!event || !visible) {
    pRing.visible = false;
    sRing.visible = false;
    return;
  }

  const elapsed = Math.max(0, nowSeconds - event.startedAtSeconds);
  const pRadius = elapsed * event.material.pVelocityKmS;
  const sRadius = elapsed * event.material.sVelocityKmS;

  pRing.position.set(event.epicenter.xKm, 0, event.epicenter.zKm);
  sRing.position.set(event.epicenter.xKm, 0, event.epicenter.zKm);
  // Only scale the flat (x/z) footprint by radius. The ring geometry carries
  // a fixed y = 1.2 so it hovers just above the terrain; scaling y as well
  // (e.g. via scale.setScalar) multiplies that offset by the wave radius too,
  // sending the ring rocketing kilometers into the sky as the wavefront
  // expands instead of tracking the terrain surface.
  pRing.scale.set(Math.max(0.1, pRadius), 1, Math.max(0.1, pRadius));
  sRing.scale.set(Math.max(0.1, sRadius), 1, Math.max(0.1, sRadius));
  pRing.visible = pRadius < 95;
  sRing.visible = sRadius < 95;
}
