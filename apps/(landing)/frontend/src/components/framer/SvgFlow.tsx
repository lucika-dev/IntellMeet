"use client"

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react"

import { svgPathProperties } from "svg-path-properties"

type Point = {
  x: number
  y: number
}

type Particle = {
  x: number
  y: number

  vx: number
  vy: number

  tx: number
  ty: number
}

type SvgFlowProps = {
  src: string

  width?: number | string
  height?: number | string

  particleGap?: number
  particleSize?: number

  attraction?: number
  friction?: number

  interactionRadius?: number
  interactionForce?: number

  background?: string

  className?: string
}

const svgCache = new Map<string, Point[]>()

async function loadSvgPoints(
  src: string,
  gap: number,
): Promise<Point[]> {
  const cacheKey = `${src}-${gap}`

  const cached = svgCache.get(cacheKey)

  if (cached) return cached

  const svgText = await fetch(src).then((r) => r.text())

  const doc = new DOMParser().parseFromString(
    svgText,
    "image/svg+xml",
  )

  const paths = [...doc.querySelectorAll("path")]

  const points: Point[] = []

  for (const path of paths) {
    const d = path.getAttribute("d")

    if (!d) continue

    const properties = new svgPathProperties(d)

    const length = properties.getTotalLength()

    for (let i = 0; i < length; i += gap) {
      const point =
        properties.getPointAtLength(i)

      points.push({
        x: point.x,
        y: point.y,
      })
    }
  }

  svgCache.set(cacheKey, points)

  return points
}

function normalizePoints(
  points: Point[],
  width: number,
  height: number,
) {
  let minX = Infinity
  let minY = Infinity

  let maxX = -Infinity
  let maxY = -Infinity

  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y

    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  const svgWidth = maxX - minX
  const svgHeight = maxY - minY

  const scale = Math.min(
    width / (svgWidth + 80),
    height / (svgHeight + 80),
  )

  const offsetX =
    width / 2 - (svgWidth * scale) / 2

  const offsetY =
    height / 2 - (svgHeight * scale) / 2

  return points.map((p) => ({
    x: (p.x - minX) * scale + offsetX,
    y: (p.y - minY) * scale + offsetY,
  }))
}

const SvgFlow = memo(function SvgFlow({
  src,

  width = "100%",
  height = 600,

  particleGap = 3,
  particleSize = 1.8,

  attraction = 0.02,
  friction = 0.9,

  interactionRadius = 120,
  interactionForce = 6,

  background = "transparent",

  className,
}: SvgFlowProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null)

  const particlesRef = useRef<Particle[]>([])

  const animationRef = useRef(0)

  const colorRef = useRef("#ffffff")

  const mouseRef = useRef({
    x: -99999,
    y: -99999,
  })

  const updateColor = useCallback(() => {
    if (!containerRef.current) return

    const computed = getComputedStyle(
      containerRef.current,
    )

    colorRef.current = computed.color
  }, [])

  const initialize = useCallback(async () => {
    const canvas = canvasRef.current

    if (!canvas) return

    const parent = canvas.parentElement

    if (!parent) return

    const rect = parent.getBoundingClientRect()

    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const rawPoints = await loadSvgPoints(
      src,
      particleGap,
    )

    const points = normalizePoints(
      rawPoints,
      rect.width,
      rect.height,
    )

    const existing = particlesRef.current

    const particles: Particle[] = []

    for (let i = 0; i < points.length; i++) {
      const point = points[i]

      const old = existing[i]

      particles.push({
        x: old
          ? old.x
          : Math.random() * rect.width,

        y: old
          ? old.y
          : Math.random() * rect.height,

        vx: old ? old.vx : 0,
        vy: old ? old.vy : 0,

        tx: point.x,
        ty: point.y,
      })
    }

    particlesRef.current = particles
  }, [particleGap, src])

  useEffect(() => {
    updateColor()

    const observer = new MutationObserver(
      updateColor,
    )

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [updateColor])

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const resize = () => {
      initialize()
      updateColor()
    }

    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener(
        "resize",
        resize,
      )
    }
  }, [initialize, updateColor])

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (!ctx) return

    let mounted = true

    const render = () => {
      if (!mounted) return

      const rect =
        canvas.getBoundingClientRect()

      ctx.clearRect(
        0,
        0,
        rect.width,
        rect.height,
      )

      if (background !== "transparent") {
        ctx.fillStyle = background

        ctx.fillRect(
          0,
          0,
          rect.width,
          rect.height,
        )
      }

      ctx.fillStyle = colorRef.current

      const particles = particlesRef.current

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = p.tx - p.x
        const dy = p.ty - p.y

        p.vx += dx * attraction
        p.vy += dy * attraction

        const mdx = p.x - mx
        const mdy = p.y - my

        const distSq =
          mdx * mdx + mdy * mdy

        if (
          distSq <
          interactionRadius * interactionRadius
        ) {
          const dist = Math.sqrt(distSq) || 1

          const force =
            (interactionRadius - dist) /
            interactionRadius

          p.vx +=
            (mdx / dist) *
            force *
            interactionForce

          p.vy +=
            (mdy / dist) *
            force *
            interactionForce
        }

        p.vx *= friction
        p.vy *= friction

        p.x += p.vx
        p.y += p.vy

        ctx.beginPath()

        ctx.arc(
          p.x,
          p.y,
          particleSize,
          0,
          Math.PI * 2,
        )

        ctx.fill()
      }

      animationRef.current =
        requestAnimationFrame(render)
    }

    render()

    return () => {
      mounted = false

      cancelAnimationFrame(
        animationRef.current,
      )
    }
  }, [
    attraction,
    friction,
    interactionRadius,
    interactionForce,
    particleSize,
    background,
  ])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={(e) => {
          const rect =
            e.currentTarget.getBoundingClientRect()

          mouseRef.current.x =
            e.clientX - rect.left

          mouseRef.current.y =
            e.clientY - rect.top
        }}
        onMouseLeave={() => {
          mouseRef.current.x = -99999
          mouseRef.current.y = -99999
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  )
})

export default SvgFlow;