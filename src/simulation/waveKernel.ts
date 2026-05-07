import type {
  SeismicScenario,
  WaveEvent,
  Wavefield,
  WaveKernel,
} from "./types";
import { buildCpuWavefield } from "./waveMath";

const outputChannels = 4;

export class CpuWaveKernel implements WaveKernel {
  readonly mode = "cpu" as const;
  private readonly scenario: SeismicScenario;

  constructor(scenario: SeismicScenario) {
    this.scenario = scenario;
  }

  async compute(
    event: WaveEvent | null,
    nowSeconds: number,
  ): Promise<Wavefield> {
    return buildCpuWavefield(
      this.scenario.gridSize,
      this.scenario.worldSizeKm,
      event,
      nowSeconds,
    );
  }

  dispose(): void {
    return;
  }
}

export async function createWaveKernel(
  scenario: SeismicScenario,
): Promise<WaveKernel> {
  if (!("gpu" in navigator) || !navigator.gpu) {
    return new CpuWaveKernel(scenario);
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (!device) {
      return new CpuWaveKernel(scenario);
    }

    return new GpuWaveKernel(device, scenario);
  } catch {
    return new CpuWaveKernel(scenario);
  }
}

class GpuWaveKernel implements WaveKernel {
  readonly mode = "webgpu" as const;

  private readonly device: GPUDevice;
  private readonly scenario: SeismicScenario;
  private readonly outputBuffer: GPUBuffer;
  private readonly readBuffer: GPUBuffer;
  private readonly uniformBuffer: GPUBuffer;
  private readonly bindGroup: GPUBindGroup;
  private readonly pipeline: GPUComputePipeline;
  private readonly byteLength: number;

  constructor(device: GPUDevice, scenario: SeismicScenario) {
    this.device = device;
    this.scenario = scenario;
    this.byteLength =
      scenario.gridSize *
      scenario.gridSize *
      outputChannels *
      Float32Array.BYTES_PER_ELEMENT;
    this.outputBuffer = device.createBuffer({
      size: this.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });
    this.readBuffer = device.createBuffer({
      size: this.byteLength,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    this.uniformBuffer = device.createBuffer({
      size: 16 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const shaderModule = device.createShaderModule({
      code: waveComputeShader,
    });

    this.pipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: shaderModule,
        entryPoint: "main",
      },
    });

    this.bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.outputBuffer } },
      ],
    });
  }

  async compute(
    event: WaveEvent | null,
    nowSeconds: number,
  ): Promise<Wavefield> {
    const material = event?.material ?? this.scenario.material;
    const elapsed = event ? nowSeconds - event.startedAtSeconds : 0;
    const uniforms = new Float32Array([
      elapsed,
      event?.epicenter.xKm ?? 0,
      event?.epicenter.zKm ?? 0,
      event?.magnitude ?? 0,
      material.pVelocityKmS,
      material.sVelocityKmS,
      material.attenuation,
      this.scenario.gridSize,
      this.scenario.worldSizeKm,
      material.pFrequencyHz,
      material.sFrequencyHz,
      event ? 1 : 0,
      0,
      0,
      0,
      0,
    ]);

    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(this.scenario.gridSize / 8),
      Math.ceil(this.scenario.gridSize / 8),
    );
    pass.end();
    encoder.copyBufferToBuffer(
      this.outputBuffer,
      0,
      this.readBuffer,
      0,
      this.byteLength,
    );
    this.device.queue.submit([encoder.finish()]);

    await this.readBuffer.mapAsync(GPUMapMode.READ);
    const copy = new Float32Array(this.readBuffer.getMappedRange()).slice();
    this.readBuffer.unmap();

    return {
      mode: "webgpu",
      gridSize: this.scenario.gridSize,
      worldSizeKm: this.scenario.worldSizeKm,
      values: copy,
    };
  }

  dispose(): void {
    this.outputBuffer.destroy();
    this.readBuffer.destroy();
    this.uniformBuffer.destroy();
  }
}

const waveComputeShader = /* wgsl */ `
struct Params {
  values: array<f32, 16>,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> output: array<vec4<f32>>;

fn terrain_height(x: f32, z: f32) -> f32 {
  let ridge = sin(x * 0.095) * 1.6;
  let basin = cos(z * 0.075 + x * 0.018) * 1.1;
  let folded = sin((x + z) * 0.035) * 0.8;
  return ridge + basin + folded;
}

fn ricker(tau: f32, frequency: f32) -> f32 {
  let scaled = 3.14159265 * frequency * tau;
  let squared = scaled * scaled;
  return (1.0 - 2.0 * squared) * exp(-squared);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let grid = u32(params.values[7]);
  if (id.x >= grid || id.y >= grid) {
    return;
  }

  let index = id.y * grid + id.x;
  let world = params.values[8];
  let half = world * 0.5;
  let denom = f32(grid - 1u);
  let x = (f32(id.x) / denom) * world - half;
  let z = (f32(id.y) / denom) * world - half;
  let base = terrain_height(x, z);
  let active = params.values[11];

  if (active < 0.5) {
    output[index] = vec4<f32>(base, 0.0, 0.0, base);
    return;
  }

  let elapsed = params.values[0];
  let ox = params.values[1];
  let oz = params.values[2];
  let magnitude = max(0.4, params.values[3] - 4.8);
  let p_velocity = params.values[4];
  let s_velocity = params.values[5];
  let attenuation = params.values[6];
  let p_frequency = params.values[9];
  let s_frequency = params.values[10];
  let distance = max(0.05, length(vec2<f32>(x - ox, z - oz)));
  let damp = exp(-distance * attenuation);
  let p = ricker(elapsed - distance / p_velocity, p_frequency);
  let s = ricker(elapsed - distance / s_velocity, s_frequency);
  let height = base + (p * 1.7 + s * 2.5) * damp * magnitude;
  let p_intensity = min(1.0, abs(p) * damp * magnitude * 0.6);
  let s_intensity = min(1.0, abs(s) * damp * magnitude * 0.8);
  output[index] = vec4<f32>(height, p_intensity, s_intensity, base);
}
`;
