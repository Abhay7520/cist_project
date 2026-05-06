"use client"

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  connections: number[]
  pulse: number
  pulseSpeed: number
}

export function EnergyGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const nodes: Node[] = []
    const gridSize = 100

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initGrid()
    }

    const initGrid = () => {
      nodes.length = 0
      const cols = Math.ceil(canvas.width / gridSize) + 1
      const rows = Math.ceil(canvas.height / gridSize) + 1

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const index = i * cols + j
          const connections: number[] = []
          
          // Connect to right neighbor
          if (j < cols - 1) connections.push(index + 1)
          // Connect to bottom neighbor
          if (i < rows - 1) connections.push(index + cols)

          nodes.push({
            x: j * gridSize + (Math.random() - 0.5) * 20,
            y: i * gridSize + (Math.random() - 0.5) * 20,
            connections,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.02
          })
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      nodes.forEach((node, i) => {
        node.pulse += node.pulseSpeed
        const pulseIntensity = (Math.sin(node.pulse) + 1) / 2

        node.connections.forEach(connIndex => {
          const other = nodes[connIndex]
          if (!other) return

          // Create gradient for energy flow effect
          const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y)
          const flowPhase = (Date.now() / 2000 + i * 0.1) % 1

          gradient.addColorStop(Math.max(0, flowPhase - 0.2), 'rgba(56, 189, 248, 0.05)')
          gradient.addColorStop(flowPhase, 'rgba(34, 211, 238, 0.4)')
          gradient.addColorStop(Math.min(1, flowPhase + 0.2), 'rgba(56, 189, 248, 0.05)')

          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1
          ctx.stroke()
        })

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2 + pulseIntensity * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + pulseIntensity * 0.4})`
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(node.x, node.y, 4 + pulseIntensity * 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(56, 189, 248, ${0.1 + pulseIntensity * 0.1})`
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-60"
      style={{ zIndex: 0 }}
    />
  )
}
