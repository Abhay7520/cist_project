"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Thermometer, Info, TrendingUp } from 'lucide-react'
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
import { WeatherService } from '@/lib/weather-service'

interface WeatherVsDemandChartProps {
  area?: string
}

export function WeatherVsDemandChart({ area = 'Hyderabad' }: WeatherVsDemandChartProps) {
  const [chartData, setChartData] = useState<Array<{ temperature: number; demand: number; expectedDemand: number }>>([])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      const data = await WeatherService.getTemperatureVsDemandChartData(area)
      if (isMounted) {
        setChartData(data)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [area])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6 border border-border/50 glow-blue relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2.5" style={{ fontFamily: 'var(--font-heading)' }}>
            <Thermometer className="w-5 h-5 text-amber-400" />
            Temperature vs Electricity Demand Relationship
          </h3>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Interactive correlation model • Zone: <span className="text-primary font-semibold">{area}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Baseline Demand (MW)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-muted-foreground">Weather-Adjusted Peak (MW)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tempDemandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expectedDemandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.8 0.18 90)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.8 0.18 90)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
            <XAxis
              dataKey="temperature"
              stroke="oklch(0.65 0.02 250)"
              tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
              tickLine={false}
              unit="°C"
            />
            <YAxis
              stroke="oklch(0.65 0.02 250)"
              tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(val / 1000).toFixed(1)}k MW`}
            />
            <Tooltip
              contentStyle={{
                background: 'oklch(0.15 0.02 250 / 0.95)',
                border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                borderRadius: '8px',
                fontFamily: 'var(--font-rajdhani)',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value: any, name: any) => [`${value} MW`, name]}
              labelFormatter={(label) => `Ambient Temperature: ${label}°C`}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-rajdhani)', fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="demand"
              stroke="oklch(0.7 0.18 200)"
              strokeWidth={2}
              fill="url(#tempDemandGradient)"
              name="Baseline Grid Load"
            />
            <Area
              type="monotone"
              dataKey="expectedDemand"
              stroke="oklch(0.8 0.18 90)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#expectedDemandGradient)"
              name="Peak Thermal Load"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation text */}
      <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/40 flex items-start gap-2.5 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-foreground">Correlation Insight: </span>
          Historical analysis indicates that higher temperatures are associated with increased electricity demand. As temperatures elevate above 28°C, heavy HVAC cooling demand creates exponential load spikes on the grid.
        </p>
      </div>
    </motion.div>
  )
}
