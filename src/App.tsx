import { buildInfo } from './generated/buildInfo'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="app-title">
        <p className="eyebrow">SPECFEM3D micro-subset · WebGPU · Three.js · Web Audio</p>
        <h1 id="app-title">Earthquake-Wave Propagation</h1>
        <p className="lede">
          Click a mapped fault, then watch and hear P-waves outrun S-waves across a browser
          terrain model.
        </p>
        <div className="link-row" aria-label="Project links">
          <a href={buildInfo.repositoryUrl}>GitHub repository</a>
          <a href={buildInfo.paypalUrl}>Support on PayPal</a>
        </div>
        <p className="version-line">
          v{buildInfo.version} · commit {buildInfo.commit}
        </p>
      </section>
    </main>
  )
}

export default App
