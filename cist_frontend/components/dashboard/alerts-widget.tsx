"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import Link from 'next/link'

interface Alert {
  id: number
  type: 'critical' | 'warning' | 'info'
  message: string
  time: string
  location?: string
}

const defaultAlerts: Alert[] = [
  {
    id: 1,
    type: 'warning',
    message: 'Substation #7 load at 85%',
    time: '2 min ago',
    location: 'North District'
  },
  {
    id: 2,
    type: 'info',
    message: 'Scheduled maintenance: Line 23',
    time: '15 min ago',
    location: 'Industrial Zone'
  },
  {
    id: 3,
    type: 'critical',
    message: 'Power surge detected',
    time: '1 hour ago',
    location: 'West Sector'
  }
]

const alertConfig = {
  critical: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    pulse: true
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[oklch(0.75_0.18_60)]',
    bg: 'bg-[oklch(0.75_0.18_60)]/10',
    border: 'border-[oklch(0.75_0.18_60)]/30',
    pulse: false
  },
  info: {
    icon: Info,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    pulse: false
  }
}

export function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/alerts')
        if (res.ok) {
          const json = await res.json()
          if (!json.error && Array.isArray(json.alerts)) {
            setAlerts(json.alerts)
            return
          }
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      }
    }

    fetchAlerts()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6 border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Active Alerts
          </h3>
        </div>
        <Link
          href="/dashboard/alerts"
          className="text-xs text-primary hover:text-primary/80 transition-colors"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const config = alertConfig[alert.type]
          const Icon = config.icon

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg ${config.bg} border ${config.border} flex items-start gap-3 group relative`}
            >
              {config.pulse && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg border-2 border-destructive/50"
                />
              )}
              <div className={`p-1.5 rounded-md ${config.bg} shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {alert.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {alert.time}
                  </span>
                  {alert.location && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {alert.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button className="p-1 rounded-md hover:bg-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
