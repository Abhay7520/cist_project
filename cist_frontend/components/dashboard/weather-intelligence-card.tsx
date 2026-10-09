"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Thermometer, Droplets, Wind, CloudSun, AlertTriangle, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { WeatherService, WeatherData } from '@/lib/weather-service'

interface WeatherIntelligenceCardProps {
  selectedArea?: string
}

export function WeatherIntelligenceCard({ selectedArea = 'Hyderabad' }: WeatherIntelligenceCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadWeather = async () => {
      setLoading(true)
      const data = await WeatherService.getWeatherData(selectedArea)
      if (isMounted) {
        setWeather(data)
        setLoading(false)
      }
    }

    loadWeather()
    const interval = setInterval(loadWeather, 15000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [selectedArea])

  const impactColor = 
    weather?.demandImpact === 'High' ? 'text-[oklch(0.6_0.22_25)] bg-[oklch(0.6_0.22_25)]/15 border-[oklch(0.6_0.22_25)]/30' :
    weather?.demandImpact === 'Moderate' ? 'text-[oklch(0.75_0.18_60)] bg-[oklch(0.75_0.18_60)]/15 border-[oklch(0.75_0.18_60)]/30' :
    'text-accent bg-accent/15 border-accent/30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-5 border border-primary/30 relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-all shadow-lg"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
              <CloudSun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Weather Intelligence
              </h3>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Live zone climate • <span className="text-primary font-semibold">{weather?.area || selectedArea}</span>
              </p>
            </div>
          </div>
          
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${impactColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
            Impact: {weather?.demandImpact || 'Moderate'}
          </span>
        </div>

        {/* Weather Metrics */}
        {loading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Temperature */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Temperature
                </span>
                <span className="text-xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {weather?.temperature}°C
                </span>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 flex items-center gap-3">
              <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400 shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Humidity
                </span>
                <span className="text-xl font-extrabold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {weather?.humidity}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Weather Condition & Predicted Demand Summary */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            <span className="text-muted-foreground">Condition:</span>
            <span className="font-semibold text-foreground">{weather?.weatherCondition || 'Hot / Clear'}</span>
          </div>
          <div className="flex items-center justify-between text-xs" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            <span className="text-muted-foreground">Predicted Demand:</span>
            <span className="font-bold text-primary flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {Math.round(5240 * (weather?.demandImpact === 'High' ? 1.15 : 1.0)).toLocaleString()} MW
            </span>
          </div>
          <div className="flex items-center justify-between text-xs" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            <span className="text-muted-foreground">Demand Risk:</span>
            <span className={`font-bold ${weather?.demandImpact === 'High' ? 'text-[oklch(0.6_0.22_25)]' : 'text-[oklch(0.75_0.18_60)]'}`}>
              {weather?.demandImpact === 'High' ? 'HIGH' : 'MODERATE'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <Link
        href="/dashboard/forecast"
        className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 hover:bg-primary/20 text-xs font-semibold text-primary transition-all group-hover:px-4"
        style={{ fontFamily: 'var(--font-rajdhani)' }}
      >
        <span>View Full Weather-Aware Forecast</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  )
}
