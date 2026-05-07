# Earthquake-Wave Propagation

Live site: https://baditaflorin.github.io/earthquake-wave-propagation/

Repository: https://github.com/baditaflorin/earthquake-wave-propagation

Interactive WebGPU demo: click a fault to see and hear P-waves and S-waves
propagate across terrain.

## Quickstart

```bash
npm install
make dev
make build
make test
make smoke
```

## Architecture

```mermaid
flowchart LR
  user["Browser user"] --> pages["GitHub Pages static app"]
  pages --> react["React control shell"]
  react --> three["Three.js terrain scene"]
  react --> audio["Web Audio sonification"]
  react --> gpu["WebGPU wave compute"]
  gpu --> fallback["CPU fallback when unavailable"]
```

## Project Links

GitHub: https://github.com/baditaflorin/earthquake-wave-propagation

PayPal: https://www.paypal.com/paypalme/florinbadita
