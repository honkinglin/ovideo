import { useEffect, useRef } from "react"

export function BgCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    // Responsive resize
    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener("resize", handleResize)

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Particle config
    const particles: { x: number; y: number; vx: number; vy: number }[] = []
    const PARTICLE_COUNT = Math.min(60, Math.floor((width * height) / 20000)) // 更少粒子
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    // Animation loop
    let animationId = 0
    let previousFrame = 0
    function animate(now = 0) {
      animationId = requestAnimationFrame(animate)
      if (document.hidden || motion.matches || now - previousFrame < 66) return
      previousFrame = now
      if (!ctx) return
      // 每帧都获取当前主题色
      const isDark = document.documentElement.classList.contains("dark")
      const bgColor = isDark ? "#10101a" : "#f6f8fa"
      const particleColor = isDark ? "#6366f1" : "#8b5cf6"
      const lineColor = isDark ? "rgba(99,102,241,0.10)" : "rgba(139,92,246,0.10)" // 更淡

      ctx.clearRect(0, 0, width, height)
      ctx.globalAlpha = 0.7 // canvas整体更透明
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      // Draw particles
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2) // 更小更淡
        ctx.fillStyle = particleColor
        ctx.shadowColor = particleColor
        ctx.shadowBlur = 4
        ctx.globalAlpha = 0.35 // 粒子更淡
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = lineColor
            ctx.lineWidth = 0.7 - dist / 140
            ctx.globalAlpha = Math.max(0, 0.18 - dist / 600) // 线更淡
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      // Move particles
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      }

    }
    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        background: "transparent",
      }}
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
