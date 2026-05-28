import { Channel } from '@/shared/types'
import { DrawChartProps, WorkerObj } from './worker/paintWorker'
import * as Comlink from 'comlink'

export type PaintResult = ImageBitmap | ImageData
export type ExecutableFunc = (props: DrawChartProps) => PaintResult
export type ChannelFuncs = {
  [K in Channel]: Comlink.Remote<ExecutableFunc>
}

function createPaintWorker(): Worker {
  return new Worker(new URL('./worker/paintWorker.ts', import.meta.url), {
    type: 'module',
  })
}

/*
 * context switching overhead and multicore throttling kills burst performance
 *
 *  1c/12 = 5550ms = 100%    (+0, 0% ovh)
 *  2c/12 = 2850ms =  51%    (+1, 2% ovh)
 * ...
 */
const OPTIMAL_GAIN_CORES_RATIO = 2 / 3
const logicalCores =
  typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1
const physicalCores = logicalCores / 2

export function convertWorkerToFuncs(
  worker: Comlink.Remote<WorkerObj>
): ChannelFuncs {
  return {
    l: worker.drawLuminosityChart,
    c: worker.drawChromaChart,
    h: worker.drawHueChart,
  }
}

export class CanvasWorkerPool {
  static readonly optimalPoolSize = Math.max(
    1,
    typeof navigator !== 'undefined'
      ? Math.floor(physicalCores * OPTIMAL_GAIN_CORES_RATIO)
      : 1
  )

  private readonly workers: Worker[]
  private readonly comlinks: Comlink.Remote<WorkerObj>[]
  private readonly funcs: ChannelFuncs[]

  constructor(size: number = CanvasWorkerPool.optimalPoolSize) {
    const workers = new Array(size).fill(0).map(() => createPaintWorker())
    const comlinks = workers.map(w => Comlink.wrap<WorkerObj>(w))

    const funcs = comlinks.map(convertWorkerToFuncs)

    this.workers = workers
    this.comlinks = comlinks
    this.funcs = funcs
  }

  get channelFuncs(): ChannelFuncs[] {
    if (this.funcs.length > 0) {
      return this.funcs
    } else {
      throw new Error('Worker pool has been released')
    }
  }

  release(): void {
    this.comlinks.forEach(c => c[Comlink.releaseProxy]())
    this.workers.forEach(w => w.terminate())
    this.funcs.splice(0, this.funcs.length)
  }
}

/** Client-only singleton; SSR uses empty array (render path only runs in useEffect on client). */
const pool =
  typeof window !== 'undefined' ? new CanvasWorkerPool() : undefined

export const channelFuncs =
  pool?.channelFuncs ?? ([] as ChannelFuncs[])
export const { optimalPoolSize } = CanvasWorkerPool
