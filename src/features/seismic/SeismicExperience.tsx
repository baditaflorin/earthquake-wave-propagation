import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  GitFork,
  Heart,
  MapPin,
  RadioTower,
  Volume2,
  Zap,
} from "lucide-react";
import { SeismicAudioEngine } from "../../audio/seismicAudio";
import { SeismicStage } from "../../rendering/SeismicStage";
import { buildInfo } from "../../generated/buildInfo";
import {
  cascadiaMicroScenario,
  seismicScenarios,
  seismometer,
} from "../../simulation/scenario";
import type { Epicenter, WaveEvent, WaveMode } from "../../simulation/types";
import { formatArrival, sampleWaveAt } from "../../simulation/waveMath";
import {
  defaultPreferences,
  readPreferences,
  type SeismicPreferences,
  writePreferences,
} from "./preferences";

export default function SeismicExperience() {
  const [preferences, setPreferences] = useState<SeismicPreferences>(() => {
    if (typeof window === "undefined") {
      return defaultPreferences;
    }

    return readPreferences();
  });
  const [scenario, setScenario] = useState(cascadiaMicroScenario);
  const [activeEvent, setActiveEvent] = useState<WaveEvent | null>(null);
  const [kernelMode, setKernelMode] = useState<WaveMode>("cpu");
  const [stageStatus, setStageStatus] = useState("Ready");
  const [clockSeconds, setClockSeconds] = useState(
    () => performance.now() / 1000,
  );
  const audioRef = useRef<SeismicAudioEngine | null>(null);

  useEffect(() => {
    writePreferences(preferences);
    audioRef.current?.setGain(preferences.audioGain);
  }, [preferences]);

  useEffect(() => {
    audioRef.current = new SeismicAudioEngine();
    const interval = window.setInterval(
      () => setClockSeconds(performance.now() / 1000),
      160,
    );

    return () => {
      window.clearInterval(interval);
      audioRef.current?.dispose();
    };
  }, []);

  const strikeFault = useCallback(
    (epicenter: Epicenter, label: string) => {
      const event: WaveEvent = {
        id: crypto.randomUUID(),
        epicenter,
        startedAtSeconds: performance.now() / 1000,
        magnitude: preferences.magnitude,
        material: {
          ...scenario.material,
          attenuation: preferences.attenuation,
        },
      };

      setActiveEvent(event);
      setStageStatus(`${label} · source armed`);
      void audioRef.current?.playEvent(event, preferences.audioGain);
    },
    [
      preferences.attenuation,
      preferences.audioGain,
      preferences.magnitude,
      scenario,
    ],
  );

  const strikePrimaryFault = useCallback(() => {
    const fault = scenario.faults[0];
    strikeFault(
      {
        xKm: (fault.start[0] + fault.end[0]) / 2,
        zKm: (fault.start[1] + fault.end[1]) / 2,
      },
      fault.name,
    );
  }, [scenario, strikeFault]);

  const handleScenarioChange = useCallback((nextId: string) => {
    const next = seismicScenarios.find((s) => s.id === nextId);
    if (next) {
      setScenario(next);
      setActiveEvent(null);
      setStageStatus(`${next.name} loaded`);
    }
  }, []);

  const seismometerSample = useMemo(
    () => sampleWaveAt(seismometer, activeEvent, clockSeconds),
    [activeEvent, clockSeconds],
  );

  const updatePreference = <Key extends keyof SeismicPreferences>(
    key: Key,
    value: SeismicPreferences[Key],
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="seismic-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            SPECFEM3D micro-subset · WebGPU · Three.js · Web Audio
          </p>
          <h1>Earthquake-Wave Propagation</h1>
        </div>
        <nav className="top-actions" aria-label="Project links">
          <a href={buildInfo.repositoryUrl} target="_blank" rel="noreferrer">
            <GitFork size={18} aria-hidden="true" />
            Star on GitHub
          </a>
          <a href={buildInfo.paypalUrl} target="_blank" rel="noreferrer">
            <Heart size={18} aria-hidden="true" />
            PayPal
          </a>
        </nav>
      </header>

      <section
        className="simulation-layout"
        aria-label="Earthquake wave simulator"
      >
        <SeismicStage
          scenario={scenario}
          activeEvent={activeEvent}
          exaggeration={preferences.exaggeration}
          showArrivalBands={preferences.showArrivalBands}
          onStrike={strikeFault}
          onModeChange={setKernelMode}
          onStageStatus={setStageStatus}
        />

        <aside className="control-surface" aria-label="Simulation controls">
          <div
            className="scenario-row"
            role="radiogroup"
            aria-label="Seismic scenario"
          >
            {seismicScenarios.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={option.id === scenario.id}
                className={
                  option.id === scenario.id
                    ? "scenario-chip active"
                    : "scenario-chip"
                }
                onClick={() => handleScenarioChange(option.id)}
                title={`${option.name} · Vp ${option.material.pVelocityKmS} km/s · Vs ${option.material.sVelocityKmS} km/s`}
              >
                {option.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <button
            className="strike-button"
            type="button"
            onClick={strikePrimaryFault}
          >
            <Zap size={20} aria-hidden="true" />
            Strike fault
          </button>

          <div className="readout-grid" aria-label="Wave readouts">
            <Readout
              icon={<Activity size={17} />}
              label="Compute"
              value={kernelMode.toUpperCase()}
            />
            <Readout
              icon={<RadioTower size={17} />}
              label="P arrival"
              value={formatArrival(seismometerSample.pArrivalSeconds)}
            />
            <Readout
              icon={<MapPin size={17} />}
              label="S arrival"
              value={formatArrival(seismometerSample.sArrivalSeconds)}
            />
          </div>

          <ControlSlider
            label="Magnitude"
            min={5.2}
            max={8.4}
            step={0.1}
            value={preferences.magnitude}
            onChange={(value) => updatePreference("magnitude", value)}
          />
          <ControlSlider
            label="Attenuation"
            min={0.002}
            max={0.025}
            step={0.001}
            value={preferences.attenuation}
            onChange={(value) => updatePreference("attenuation", value)}
          />
          <ControlSlider
            label="Relief"
            min={0.35}
            max={1.8}
            step={0.05}
            value={preferences.exaggeration}
            onChange={(value) => updatePreference("exaggeration", value)}
          />
          <ControlSlider
            label="Audio"
            min={0}
            max={0.9}
            step={0.03}
            value={preferences.audioGain}
            onChange={(value) => updatePreference("audioGain", value)}
            icon={<Volume2 size={16} aria-hidden="true" />}
          />

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={preferences.showArrivalBands}
              onChange={(event) =>
                updatePreference(
                  "showArrivalBands",
                  event.currentTarget.checked,
                )
              }
            />
            <span>Arrival bands</span>
          </label>

          <div className="status-line" aria-live="polite">
            {stageStatus}
          </div>
        </aside>
      </section>

      <footer className="build-footer">
        <span>v{buildInfo.version}</span>
        <span>commit {buildInfo.commit}</span>
        <a href={buildInfo.pagesUrl}>live map</a>
        <a href={buildInfo.repositoryUrl}>repository</a>
      </footer>
    </main>
  );
}

function Readout({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="readout">
      <span className="readout-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ControlSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  icon,
}: {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly icon?: ReactNode;
}) {
  return (
    <label className="slider-control">
      <span>
        {icon}
        {label}
        <strong>{value.toFixed(step < 0.01 ? 3 : 1)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}
