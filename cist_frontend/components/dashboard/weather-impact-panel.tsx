"use client"

import { motion } from 'framer-motion'
import { Thermometer, Droplets, Brain, Sparkles, MapPin, Gauge, Cpu, ArrowRight } from 'lucide-react'

interface WeatherImpactPanelProps {
  area?: string
  temperature?: number
  humidity?: number
  expectedImpact?: 'Low' | 'Moderate' | 'High'
  aiInsight?: string
}

export function WeatherImpactPanel({
  area = 'Hyderabad Zone',
  temperature = 39,
  humidity = 62,
  expectedImpact = 'High',
  aiInsight = 'High temperature conditions may increase electricity consumption, particularly during peak hours.'
}: WeatherImpactPanelProps) {
  const impactBadgeColor =
    expectedImpact === 'High'
      ? 'bg-[oklch(0.6_0.22_25)]/20 text-[oklch(0.6_0.22_25)] border-[oklch(0.6_0.22_25)]/40 glow-red'
      : expectedImpact === 'Moderate'
      ? 'bg-[oklch(0.75_0.18_60)]/20 text-[oklch(0.75_0.18_60)] border-[oklch(0.75_0.18_60)]/40 glow-orange'
      : 'bg-accent/20 text-accent border-accent/40'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6 border border-primary/30 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              <Brain className="w-4 h-4 text-primary" />
              Intelligence Layer
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Weather Impact on Demand
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Expected Impact:
          </span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold border ${impactBadgeColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
            {expectedImpact.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Conceptual Prediction Flow Diagram */}
      <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          Multi-Factor AI Prediction Pipeline
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center">
          {/* Box 1: AREA */}
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 flex flex-col items-center">
            <MapPin className="w-4 h-4 text-primary mb-1" />
            <span className="text-[11px] font-bold text-foreground uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              Area Zone
            </span>
            <span className="text-[10px] text-muted-foreground truncate w-full" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {area}
            </span>
          </div>

          <div className="hidden md:flex justify-center text-primary/60 font-bold">+</div>

          {/* Box 2: EXISTING METRICS */}
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 flex flex-col items-center">
            <Gauge className="w-4 h-4 text-primary mb-1" />
            <span className="text-[11px] font-bold text-foreground uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              Demand Metrics
            </span>
            <span className="text-[10px] text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Load & Services
            </span>
          </div>

          <div className="hidden md:flex justify-center text-primary/60 font-bold">+</div>

          {/* Box 3: WEATHER CONDITIONS */}
          <div className="p-2.5 rounded-lg bg-accent/20 border border-accent/40 flex flex-col items-center">
            <Thermometer className="w-4 h-4 text-accent mb-1" />
            <span className="text-[11px] font-bold text-accent uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              Weather Layer
            </span>
            <span className="text-[10px] text-foreground font-semibold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {temperature}°C • {humidity}%
            </span>
          </div>
        </div>

        <div className="flex justify-center my-3 text-primary">
          <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0 text-primary animate-pulse" />
        </div>

        {/* AI DEMAND FORECAST -> PREDICTED DEMAND */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              AI Weather-Aware Demand Forecast Engine
            </span>
          </div>
          <span className="text-xs font-extrabold text-accent px-3 py-1 rounded-md bg-background/50 border border-accent/30" style={{ fontFamily: 'var(--font-heading)' }}>
            Predicted Demand Output
          </span>
        </div>
      </div>

      {/* Weather Factors & AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Ambient Temperature
            </span>
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {temperature}°C
            </span>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Thermometer className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Relative Humidity
            </span>
            <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {humidity}%
            </span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Weather Factor Impact
            </span>
            <span className={`text-2xl font-bold ${expectedImpact === 'High' ? 'text-[oklch(0.6_0.22_25)]' : 'text-accent'}`} style={{ fontFamily: 'var(--font-heading)' }}>
              {expectedImpact}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/30 relative">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/20 shrink-0 mt-0.5">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              AI Weather Insight:
            </span>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              "{aiInsight}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
