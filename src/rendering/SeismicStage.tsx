import { useEffect, useRef } from "react";
import * as THREE from "three";
import { seismometer } from "../simulation/scenario";
import type {
  Epicenter,
  SeismicScenario,
  WaveEvent,
  WaveMode,
  Wavefield,
} from "../simulation/types";
import { createWaveKernel } from "../simulation/waveKernel";
import {
  distanceToFaultKm,
  nearestPointOnSegment,
} from "../simulation/waveMath";
import { createRing, updateArrivalRings } from "./arrivalRings";

type SeismicStageProps = {
  readonly scenario: SeismicScenario;
  readonly activeEvent: WaveEvent | null;
  readonly exaggeration: number;
  readonly showArrivalBands: boolean;
  readonly onStrike: (epicenter: Epicenter, label: string) => void;
  readonly onModeChange: (mode: WaveMode) => void;
  readonly onStageStatus: (message: string) => void;
};

const faultSnapKm = 8;

export function SeismicStage({
  scenario,
  activeEvent,
  exaggeration,
  showArrivalBands,
  onStrike,
  onModeChange,
  onStageStatus,
}: SeismicStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const latestEventRef = useRef(activeEvent);
  const latestExaggerationRef = useRef(exaggeration);
  const latestBandsRef = useRef(showArrivalBands);
  const onStrikeRef = useRef(onStrike);
  const onModeChangeRef = useRef(onModeChange);
  const onStageStatusRef = useRef(onStageStatus);

  useEffect(() => {
    latestEventRef.current = activeEvent;
  }, [activeEvent]);

  useEffect(() => {
    latestExaggerationRef.current = exaggeration;
  }, [exaggeration]);

  useEffect(() => {
    latestBandsRef.current = showArrivalBands;
  }, [showArrivalBands]);

  useEffect(() => {
    onStrikeRef.current = onStrike;
    onModeChangeRef.current = onModeChange;
    onStageStatusRef.current = onStageStatus;
  }, [onModeChange, onStageStatus, onStrike]);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      return undefined;
    }

    let disposed = false;
    let animationFrame = 0;
    let computing = false;
    let kernelDispose: (() => void) | null = null;
    let lastField: Wavefield | null = null;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdfe9da);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 600);
    camera.position.set(78, 72, 88);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerElement.append(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xf7fff0, 0x40554a, 2.7);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(24, 72, 32);
    sun.castShadow = true;
    scene.add(sun);

    const geometry = new THREE.PlaneGeometry(
      scenario.worldSizeKm,
      scenario.worldSizeKm,
      scenario.gridSize - 1,
      scenario.gridSize - 1,
    );
    geometry.rotateX(-Math.PI / 2);

    const colors = new Float32Array(scenario.gridSize * scenario.gridSize * 3);
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const terrain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.92,
        vertexColors: true,
      }),
    );
    terrain.receiveShadow = true;
    scene.add(terrain);

    const faultGroup = new THREE.Group();
    for (const fault of scenario.faults) {
      const points = [
        new THREE.Vector3(fault.start[0], 1.6, fault.start[1]),
        new THREE.Vector3(fault.end[0], 1.6, fault.end[1]),
      ];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0xd34a24, linewidth: 3 }),
      );
      faultGroup.add(line);
    }
    scene.add(faultGroup);

    const pRing = createRing(0x1d8fce);
    const sRing = createRing(0xd87a1c);
    scene.add(pRing, sRing);

    const seismometerMarker = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.6, 4.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x222a24, roughness: 0.7 }),
    );
    seismometerMarker.position.set(seismometer.xKm, 4, seismometer.zKm);
    seismometerMarker.castShadow = true;
    scene.add(seismometerMarker);

    const epicenterMarker = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 24, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf6d047,
        emissive: 0x7a3a00,
        emissiveIntensity: 1.1,
      }),
    );
    epicenterMarker.visible = false;
    scene.add(epicenterMarker);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function resize() {
      const { width, height } = containerElement!.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }

    function pickFault(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(terrain, false)[0];

      if (!hit) {
        return;
      }

      const point = { xKm: hit.point.x, zKm: hit.point.z };
      const nearest = scenario.faults
        .map((fault) => ({
          fault,
          distance: distanceToFaultKm(point, fault),
          epicenter: nearestPointOnSegment(point, fault),
        }))
        .sort((a, b) => a.distance - b.distance)[0];

      if (nearest && nearest.distance <= faultSnapKm) {
        onStrikeRef.current(nearest.epicenter, nearest.fault.name);
      } else {
        onStageStatusRef.current("Pick closer to a fault trace.");
      }
    }

    renderer.domElement.addEventListener("pointerdown", pickFault);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerElement);
    resize();

    createWaveKernel(scenario).then((kernel) => {
      if (disposed) {
        kernel.dispose();
        return;
      }

      kernelDispose = () => kernel.dispose();
      onModeChangeRef.current(kernel.mode);

      const animate = () => {
        if (disposed) {
          return;
        }

        const nowSeconds = performance.now() / 1000;
        updateArrivalRings(
          pRing,
          sRing,
          latestEventRef.current,
          nowSeconds,
          latestBandsRef.current,
        );
        updateEpicenter(epicenterMarker, latestEventRef.current);

        if (!computing) {
          computing = true;
          kernel
            .compute(latestEventRef.current, nowSeconds)
            .then((field) => {
              lastField = field;
              applyWavefield(
                geometry,
                field,
                latestExaggerationRef.current,
                latestBandsRef.current,
              );
            })
            .catch(() => {
              onStageStatusRef.current(
                "Wave compute fell back on the last stable frame.",
              );
            })
            .finally(() => {
              computing = false;
            });
        } else if (lastField) {
          applyWavefield(
            geometry,
            lastField,
            latestExaggerationRef.current,
            latestBandsRef.current,
          );
        }

        terrain.rotation.y = Math.sin(nowSeconds * 0.08) * 0.025;
        faultGroup.rotation.y = terrain.rotation.y;
        pRing.rotation.y = terrain.rotation.y;
        sRing.rotation.y = terrain.rotation.y;
        renderer.render(scene, camera);
        animationFrame = requestAnimationFrame(animate);
      };

      animate();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", pickFault);
      renderer.dispose();
      geometry.dispose();
      kernelDispose?.();
      containerElement.removeChild(renderer.domElement);
    };
  }, [scenario]);

  return (
    <div
      ref={containerRef}
      className="stage-canvas"
      aria-label="Interactive seismic terrain"
    />
  );
}

function updateEpicenter(marker: THREE.Mesh, event: WaveEvent | null) {
  if (!event) {
    marker.visible = false;
    return;
  }

  marker.visible = true;
  marker.position.set(event.epicenter.xKm, 5, event.epicenter.zKm);
}

function applyWavefield(
  geometry: THREE.PlaneGeometry,
  field: Wavefield,
  exaggeration: number,
  showArrivalBands: boolean,
) {
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  const colors = geometry.getAttribute("color") as THREE.BufferAttribute;

  for (let i = 0; i < positions.count; i += 1) {
    const index = i * 4;
    const height = field.values[index];
    const p = showArrivalBands ? field.values[index + 1] : 0;
    const s = showArrivalBands ? field.values[index + 2] : 0;
    const base = field.values[index + 3];
    positions.setY(i, height * exaggeration);

    const normalized = Math.max(0, Math.min(1, (base + 4) / 8));
    const red = 0.24 + normalized * 0.34 + s * 0.52;
    const green = 0.42 + normalized * 0.28 + p * 0.25;
    const blue = 0.28 + normalized * 0.18 + p * 0.52;
    colors.setXYZ(i, Math.min(1, red), Math.min(1, green), Math.min(1, blue));
  }

  positions.needsUpdate = true;
  colors.needsUpdate = true;
  geometry.computeVertexNormals();
}
