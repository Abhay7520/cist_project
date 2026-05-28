"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { API_URL } from '@/lib/api-config'

interface DataPoint {
  time: string
  demand: number
  supply: number
}

const fallbackData = (): DataPoint[] => {
  const now = new Date()
  const data: DataPoint[] = []

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const demand = Math.round(2000 + Math.sin(i / 3) * 220 + (Math.random() - 0.5) * 140)
    const supply = Math.round(demand + 80 + (Math.random() - 0.5) * 80)

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      demand,
      supply
    })
  }

  return data
}

export function LiveChart() {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    const fetchTimeseries = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard-timeseries`)
        if (res.ok) {
          const json = await res.json()
          if (!json.error && Array.isArray(json) && json.length > 0) {
            setData(json)
            return
          }
        }
      } catch (error) {
        console.error('Failed to fetch timeseries:', error)
      }

      setData(fallbackData())
    }

    fetchTimeseries()
    const interval = setInterval(fetchTimeseries, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel rounded-xl p-6 border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Power Flow Monitor
          </h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Real-time demand vs supply (24h)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-accent"
          />
          <span className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Live
          </span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
            <XAxis
              dataKey="time"
              stroke="oklch(0.65 0.02 250)"
              tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="oklch(0.65 0.02 250)"
              tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'oklch(0.15 0.02 250 / 0.9)',
                border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                fontFamily: 'var(--font-rajdhani)'
              }}
              labelStyle={{ color: 'oklch(0.95 0.01 250)' }}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-rajdhani)', fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="supply"
              stroke="oklch(0.75 0.2 160)"
              strokeWidth={2}
              fill="url(#supplyGradient)"
              name="Supply (MW)"
            />
            <Area
              type="monotone"
              dataKey="demand"
              stroke="oklch(0.7 0.18 200)"
              strokeWidth={2}
              fill="url(#demandGradient)"
              name="Demand (MW)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
