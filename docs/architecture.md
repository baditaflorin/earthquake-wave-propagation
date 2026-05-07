# Architecture

## C4 Context

```mermaid
flowchart LR
  person["Person: public learner, educator, or science communicator"]
  pages["System: Earthquake-Wave Propagation static site on GitHub Pages"]
  github["External: GitHub repository at https://github.com/baditaflorin/earthquake-wave-propagation"]
  paypal["External: PayPal support link at https://www.paypal.com/paypalme/florinbadita"]

  person --> pages
  pages --> github
  pages --> paypal
```

## C4 Container

```mermaid
flowchart TB
  browser["Browser"]
  boundary["GitHub Pages static boundary"]
  app["React control shell"]
  scene["Three.js terrain renderer"]
  compute["WebGPU wave compute"]
  cpu["CPU wave fallback"]
  audio["Web Audio sonification"]
  storage["localStorage preferences"]

  browser --> boundary
  boundary --> app
  app --> scene
  app --> compute
  compute --> cpu
  app --> audio
  app --> storage
```

GitHub Pages serves only static assets. All simulation, rendering, audio, and
preference storage happen in the browser.
