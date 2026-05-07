import { lazy, Suspense } from "react";
import { buildInfo } from "./generated/buildInfo";
import "./App.css";

const SeismicExperience = lazy(
  () => import("./features/seismic/SeismicExperience"),
);

function App() {
  return (
    <Suspense
      fallback={
        <main className="loading-shell">
          <p className="eyebrow">
            SPECFEM3D micro-subset · WebGPU · Three.js · Web Audio
          </p>
          <h1>Earthquake-Wave Propagation</h1>
          <p>Loading terrain solver · v{buildInfo.version}</p>
        </main>
      }
    >
      <SeismicExperience />
    </Suspense>
  );
}

export default App;
