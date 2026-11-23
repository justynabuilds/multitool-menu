// Motion engine for the multitool menu. No DOM: it only holds springs and a timeline,
// so the element, the React adapter and the tests all drive the same code.

export class Spring {
  x: number
  v = 0
  t: number
  k: number
  c: number
  constructor(x = 0, k = 240, c = 19) {
    this.x = x
    this.t = x
    this.k = k
    this.c = c
  }
  step(dt: number) {
    // four substeps keep stiff springs stable at low frame rates
    const h = dt / 4
    for (let i = 0; i < 4; i++) {
      const a = -this.k * (this.x - this.t) - this.c * this.v
      this.v += a * h
      this.x += this.v * h
    }
    if (Math.abs(this.x - this.t) < 1e-4 && Math.abs(this.v) < 1e-3) this.snap(this.t)
  }
  snap(v: number) {
    this.x = this.t = v
    this.v = 0
  }
  get settled() {
    return this.x === this.t && this.v === 0
  }
}

const OPEN_DAMPING = 19

/** Spring with no overshoot for a given stiffness. */
const critical = (k: number) => new Spring(0, k, 2 * Math.sqrt(k))

export interface EngineOptions {
  count: number
  /** Angle of the first plate in degrees, measured down from the button line. */
  startAngle?: number
  /** Degrees between plates. */
  spread?: number
  /** Seconds between plates as they open. */
  stagger?: number
  /** Seconds the hover waits before letting go, so moving between plates never flashes. */
  hoverRelease?: number
  reducedMotion?: boolean
}

export interface ItemFrame {
  /** Degrees, positive swings the plate down. */
  angle: number
  /** 0 = out, 1 = slid all the way into the button. Plates never fade: they fold home and slide into the handle. */
  retract: number
  /** 0 to 1, how far the plate is pulled out on hover. */
  lift: number
  /** 0 to 1, how much the label fades while another plate is hovered. */
  dim: number
}

interface Item {
  /** true from the close command until the plate is home and starts sliding into the button */
  folding: boolean
  angle: Spring
  retract: Spring
  lift: Spring
  dim: Spring
}

export class MultitoolEngine {
  isOpen = false
  hovered = -1
  readonly count: number
  private o: Required<EngineOptions>
  private items: Item[]
  private time = 0
  private queue: { at: number; fn: () => void }[] = []
  private releaseAt = -1

  constructor(options: EngineOptions) {
    this.o = { startAngle: 12, spread: 12, stagger: 0.055, hoverRelease: 0.09, reducedMotion: false, ...options }
    this.count = options.count
    this.items = Array.from({ length: this.count }, () => ({
      folding: false,
      angle: new Spring(0, 240, OPEN_DAMPING),
      retract: Object.assign(critical(420), { x: 1, t: 1 }), // starts inside the button; no bounce, so it never pokes back out
      lift: critical(320),
      dim: critical(220),
    }))
  }

  set reducedMotion(v: boolean) {
    this.o.reducedMotion = v
  }

  angleOf(i: number) {
    return this.o.startAngle + i * this.o.spread
  }

  private at(delay: number, fn: () => void) {
    this.queue.push({ at: this.time + delay, fn })
  }

  /** Open or close. When closing after a pick, the chosen plate folds away last. Returns false if nothing changed. */
  setOpen(open: boolean, chosen = -1): boolean {
    if (open === this.isOpen) return false
    this.isOpen = open
    this.queue = []
    this.releaseAt = -1
    const n = this.count
    this.items.forEach((it, i) => {
      if (open) {
        it.folding = false
        this.at(i * this.o.stagger, () => {
          it.retract.t = 0 // slides out of the button while it swings open
          it.angle.c = OPEN_DAMPING // a little underdamped: the click into place
          it.angle.t = this.angleOf(i)
        })
      } else {
        const order = chosen === i ? n : n - 1 - i
        this.at(order * 0.04, () => {
          // fold home without overshoot (no swing up past the button line), then slide into the handle
          it.angle.c = 2 * Math.sqrt(it.angle.k)
          it.angle.t = 0
          it.folding = true
        })
      }
    })
    if (!open) this.setHover(-1)
    if (this.o.reducedMotion) this.settle()
    return true
  }

  hoverEnter(i: number) {
    if (!this.isOpen) return
    this.releaseAt = -1
    this.setHover(i)
  }

  hoverLeave(i: number) {
    if (this.hovered !== i) return
    // the plate starts sliding home at once, from where it is, without carrying outward speed;
    // only the label dimming waits, so crossing to the next plate never flashes
    const lift = this.items[i].lift
    lift.t = 0
    lift.v = Math.min(lift.v, 0)
    if (this.o.reducedMotion) lift.snap(0)
    this.releaseAt = this.time + this.o.hoverRelease
  }

  private setHover(i: number) {
    this.hovered = i
    this.items.forEach((it, j) => {
      it.lift.t = j === i ? 1 : 0
      it.dim.t = i >= 0 && j !== i ? 1 : 0
    })
    if (this.o.reducedMotion) this.items.forEach((it) => (it.lift.snap(it.lift.t), it.dim.snap(it.dim.t)))
  }

  /** Advance by dt seconds. Returns true while anything is still moving or scheduled. */
  step(dt: number): boolean {
    dt = Math.min(Math.max(dt, 0), 1 / 30)
    this.time += dt
    if (this.releaseAt >= 0 && this.time >= this.releaseAt) {
      this.releaseAt = -1
      this.setHover(-1)
    }
    this.runDue()
    for (const it of this.items) {
      if (it.folding && Math.abs(it.angle.x) < 5) {
        it.folding = false
        it.retract.t = 1
      }
    }
    let busy = this.queue.length > 0 || this.releaseAt >= 0 || this.items.some((it) => it.folding)
    for (const it of this.items) {
      for (const s of [it.angle, it.retract, it.lift, it.dim]) {
        if (this.o.reducedMotion) s.snap(s.t)
        else s.step(dt)
        if (!s.settled) busy = true
      }
    }
    return busy
  }

  private runDue() {
    for (let guard = 0; guard < 100; guard++) {
      const due = this.queue.filter((q) => q.at <= this.time)
      if (!due.length) return
      this.queue = this.queue.filter((q) => q.at > this.time)
      due.forEach((q) => q.fn())
    }
  }

  /** Jump to the end state (reduced motion, first paint). */
  settle() {
    while (this.queue.length) {
      this.time = Math.min(...this.queue.map((q) => q.at))
      this.runDue()
    }
    for (const it of this.items) if (it.folding) { it.folding = false; it.retract.t = 1 }
    for (const it of this.items) for (const s of [it.angle, it.retract, it.lift, it.dim]) s.snap(s.t)
  }

  frame(i: number): ItemFrame {
    const it = this.items[i]
    return {
      angle: it.angle.x,
      retract: Math.min(1, Math.max(0, it.retract.x)),
      lift: Math.min(1, Math.max(0, it.lift.x)),
      dim: Math.min(1, Math.max(0, it.dim.x)),
    }
  }
}
