"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

type Status = 'stable' | 'warning' | 'critical'

interface GridStatusProps {
  status?: Status
  frequency?: number
  voltage?: number
  load?: number
}

const statusConfig = {
  stable: {
    icon: CheckCircle2,
    label: 'System Stable',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    glow: 'glow-green'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    color: 'text-[oklch(0.75_0.18_60)]',
    bg: 'bg-[oklch(0.75_0.18_60)]/10',
    border: 'border-[oklch(0.75_0.18_60)]/30',
    glow: 'glow-orange'
  },
  critical: {
    icon: XCircle,
    label: 'Critical',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    glow: 'glow-red'
  }
}

export function GridStatus({ 
  status = 'stable', 
  frequency = 50.02, 
  voltage = 230.5, 
  load = 78 
}: GridStatusProps) {
  const [mounted, setMounted] = useState(false)
  const config = statusConfig[status]
  const Icon = config.icon

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-xl p-6 border ${config.border} ${config.glow}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Grid Status
        </h3>
        <motion.div
          animate={status !== 'stable' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: status !== 'stable' ? Infinity : 0 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
            {config.label}
          </span>
        </motion.div>
      </div>

      <div className="space-y-4">
        {/* Frequency */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Grid Frequency
            </span>
            <span className="text-foreground font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
              {frequency.toFixed(2)} Hz
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((frequency - 49) / 2) * 100}%` }}
              className="h-full bg-accent rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            <span>49 Hz</span>
            <span>50 Hz (nominal)</span>
            <span>51 Hz</span>
          </div>
        </div>

        {/* Voltage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              System Voltage
            </span>
            <span className="text-foreground font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
              {voltage.toFixed(1)} V
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((voltage - 200) / 60) * 100}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        {/* Load */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              System Load
            </span>
            <span className="text-foreground font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
              {load}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${load}%` }}
              className={`h-full rounded-full ${
                load > 90 ? 'bg-destructive' : load > 75 ? 'bg-[oklch(0.75_0.18_60)]' : 'bg-accent'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Activity indicator */}
      <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          Last updated: {mounted ? new Date().toLocaleTimeString() : ''}
        </span>
      </div>
    </motion.div>
  )
}
