import { useEffect, useRef, type CSSProperties } from "react"
import "../element/index.ts"
import type { MultitoolMenuElement, MultitoolSelectDetail } from "../element/index.ts"

export interface MultitoolMenuItem {
  label: string
  href?: string
  target?: string
  rel?: string
}

export interface MultitoolMenuProps {
  items: MultitoolMenuItem[]
  /** Button text. Default "Menu". */
  label?: string
  /** Controlled open state. Leave out to let the menu manage itself. */
  open?: boolean
  /** "pearl" (default): white plates with a pearl rim. "ink": dark plates. "glass": frosted plates. */
  finish?: "pearl" | "ink" | "glass"
  /** "left" (default) fans the plates out to the left, for a button on the right of the nav. */
  side?: "left" | "right"
  /** Plate length in px, measured from the rivet. Default 252. */
  length?: number
  plateHeight?: number
  startAngle?: number
  spread?: number
  /** Return false (or call preventDefault on the event) to stop the link from navigating. */
  onSelect?: (detail: MultitoolSelectDetail, event: CustomEvent<MultitoolSelectDetail>) => void | boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  style?: CSSProperties
}

export function MultitoolMenu(props: MultitoolMenuProps) {
  const ref = useRef<MultitoolMenuElement>(null)
  const handlers = useRef(props)
  handlers.current = props

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onSelect = (e: Event) => {
      const ev = e as CustomEvent<MultitoolSelectDetail>
      if (handlers.current.onSelect?.(ev.detail, ev) === false) ev.preventDefault()
    }
    const onToggle = (e: Event) => handlers.current.onOpenChange?.((e as CustomEvent<{ open: boolean }>).detail.open)
    el.addEventListener("select", onSelect)
    el.addEventListener("toggle", onToggle)
    return () => {
      el.removeEventListener("select", onSelect)
      el.removeEventListener("toggle", onToggle)
    }
  }, [])

  useEffect(() => {
    if (props.open !== undefined && ref.current && ref.current.open !== props.open) ref.current.open = props.open
  }, [props.open])

  return (
    <multitool-menu
      ref={ref}
      class={props.className}
      style={props.style}
      label={props.label}
      finish={props.finish}
      side={props.side}
      length={props.length}
      plate-height={props.plateHeight}
      start-angle={props.startAngle}
      spread={props.spread}
    >
      {props.items.map((it, i) => (
        <a key={i} href={it.href} target={it.target} rel={it.rel}>
          {it.label}
        </a>
      ))}
    </multitool-menu>
  )
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "multitool-menu": {
        ref?: React.Ref<MultitoolMenuElement>
        class?: string
        style?: React.CSSProperties
        label?: string
        finish?: string
        side?: string
        length?: number
        "plate-height"?: number
        "start-angle"?: number
        spread?: number
        children?: React.ReactNode
      }
    }
  }
}
