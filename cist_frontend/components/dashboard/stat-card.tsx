"use client"

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'red'
  subtitle?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    text: 'text-primary',
    glow: 'glow-blue'
  },
  green: {
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    text: 'text-accent',
    glow: 'glow-green'
  },
  orange: {
    bg: 'bg-[oklch(0.75_0.18_60)]/10',
    border: 'border-[oklch(0.75_0.18_60)]/30',
    text: 'text-[oklch(0.75_0.18_60)]',
    glow: 'glow-orange'
  },
  red: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    glow: 'glow-red'
  }
}

export function StatCard({ 
  title, 
  value, 
  unit, 
  change, 
  icon: Icon, 
  color = 'blue',
  subtitle 
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass-panel rounded-xl p-5 border ${colors.border} glass-panel-hover transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        {change !== undefined && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            change >= 0 
              ? 'bg-accent/10 text-accent' 
              : 'bg-destructive/10 text-destructive'
          }`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
          {unit && (
            <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  )
}
