import { test } from "node:test"
import assert from "node:assert/strict"
import { MultitoolEngine } from "../src/core/engine.ts"

const FRAME = 1 / 60
const run = (e: MultitoolEngine, seconds: number, each?: () => void) => {
  for (let t = 0; t < seconds; t += FRAME) {
    e.step(FRAME)
    each?.()
  }
}
const opened = () => {
  const e = new MultitoolEngine({ count: 5 })
  e.setOpen(true)
  run(e, 2)
  return e
}

test("opening fans the plates to their angles, 12 degrees apart", () => {
  const e = opened()
  for (let i = 0; i < 5; i++) {
    assert.ok(Math.abs(e.frame(i).angle - (12 + i * 12)) < 1e-3)
    assert.equal(e.frame(i).retract, 0)
  }
})

test("plates click into place: a small overshoot past the angle, then settle", () => {
  const e = new MultitoolEngine({ count: 1 })
  e.setOpen(true)
  let max = 0
  run(e, 2, () => (max = Math.max(max, e.frame(0).angle)))
  assert.ok(max > 12.2 && max < 14, `overshoot ${max}`)
})

test("hover off is smooth: lift only falls, never bounces below zero", () => {
  const e = opened()
  e.hoverEnter(2)
  run(e, 1.2)
  assert.equal(e.frame(2).lift, 1)
  e.hoverLeave(2)
  let prev = e.frame(2).lift
  let min = 1
  run(e, 1, () => {
    const l = e.frame(2).lift
    assert.ok(l <= prev + 1e-9, `lift rose from ${prev} to ${l}`)
    prev = l
    min = Math.min(min, l)
  })
  assert.equal(e.frame(2).lift, 0)
  assert.ok(min >= 0)
})

test("a quick swipe across a plate: it turns back the moment the pointer leaves", () => {
  const e = opened()
  e.hoverEnter(2)
  run(e, 0.08)
  e.hoverLeave(2)
  let prev = e.frame(2).lift
  assert.ok(prev > 0.1 && prev < 0.9)
  run(e, 1, () => {
    const l = e.frame(2).lift
    assert.ok(l <= prev + 1e-9, `lift kept rising after leave: ${prev} -> ${l}`)
    prev = l
  })
  assert.equal(e.frame(2).lift, 0)
})

test("hover off has no frame-one jump: the first 50ms moves less than a quarter of the way", () => {
  const e = opened()
  e.hoverEnter(1)
  run(e, 0.6)
  e.hoverLeave(1)
  run(e, 0.05)
  assert.ok(e.frame(1).lift > 0.75, `lift ${e.frame(1).lift}`)
})

test("moving straight to the next plate never un-dims the others", () => {
  const e = opened()
  e.hoverEnter(0)
  run(e, 0.6)
  e.hoverLeave(0)
  run(e, 0.03) // the pointer crosses the gap between plates
  e.hoverEnter(1)
  let minDim = 1
  run(e, 0.6, () => (minDim = Math.min(minDim, e.frame(3).dim)))
  assert.ok(minDim > 0.99, `plate 3 un-dimmed to ${minDim}`)
  assert.ok(e.frame(0).dim > 0.99 && e.frame(1).dim < 0.01)
})

test("leaving the menu releases every plate", () => {
  const e = opened()
  e.hoverEnter(3)
  run(e, 0.5)
  e.hoverLeave(3)
  run(e, 1)
  for (let i = 0; i < 5; i++) assert.deepEqual([e.frame(i).lift, e.frame(i).dim], [0, 0])
})

test("after a pick the chosen plate folds away last", () => {
  const e = opened()
  e.setOpen(false, 0)
  const hiddenAt: number[] = []
  let t = 0
  run(e, 2, () => {
    t += FRAME
    for (let i = 0; i < 5; i++) if (hiddenAt[i] === undefined && e.frame(i).retract > 0.99) hiddenAt[i] = t
  })
  assert.ok(hiddenAt.every((v) => v !== undefined))
  assert.equal(Math.max(...hiddenAt), hiddenAt[0])
})

test("closing never fades: plates fold home first, then slide into the button", () => {
  const e = opened()
  e.setOpen(false)
  let maxAngleWhenRetracting = 0
  let minAngle = 0
  run(e, 2, () => {
    for (let i = 0; i < 5; i++) {
      const f = e.frame(i)
      minAngle = Math.min(minAngle, f.angle)
      if (f.retract > 0.5) maxAngleWhenRetracting = Math.max(maxAngleWhenRetracting, Math.abs(f.angle))
    }
  })
  assert.ok(maxAngleWhenRetracting < 3, `a plate was still ${maxAngleWhenRetracting.toFixed(1)}° open when half slid in`)
  // and no plate swings up past the button line on the way home
  assert.ok(minAngle > -0.01, `a plate swung ${minAngle.toFixed(2)}° above the button line`)

  for (let i = 0; i < 5; i++) assert.equal(e.frame(i).retract, 1)
})

test("reduced motion jumps straight to the end state", () => {
  const e = new MultitoolEngine({ count: 3, reducedMotion: true })
  e.setOpen(true)
  assert.equal(e.frame(2).angle, 36)
  e.hoverEnter(1)
  assert.equal(e.frame(1).lift, 1)
})
