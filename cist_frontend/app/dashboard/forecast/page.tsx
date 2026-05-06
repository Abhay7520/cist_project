"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Clock, Calendar, TrendingUp, Thermometer, Cloud, Users, Sparkles } from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'

// Generate forecast data
const generateHourlyForecast = () => {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 24; i++) {
    const hour = (now.getHours() + i) % 24
    const isPeak = hour >= 9 && hour <= 21
    const baseDemand = 2500
    const peakMultiplier = isPeak ? 1.3 : 0.7
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      predicted: Math.round(baseDemand * peakMultiplier + (Math.random() - 0.5) * 200),
      actual: i < 3 ? Math.round(baseDemand * peakMultiplier + (Math.random() - 0.5) * 150) : null,
      confidence: Math.round(85 + Math.random() * 10)
    })
  }
  
  return data
}

const generateDailyForecast = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (now.getDay() + i) % 7
    const isWeekend = dayIndex === 0 || dayIndex === 6
    const baseDemand = isWeekend ? 2200 : 2800
    
    return {
      day: days[dayIndex],
      predicted: Math.round(baseDemand + (Math.random() - 0.5) * 300),
      peak: Math.round(baseDemand * 1.3 + (Math.random() - 0.5) * 200),
      low: Math.round(baseDemand * 0.6 + (Math.random() - 0.5) * 100)
    }
  })
}

const hourlyData = generateHourlyForecast()
const dailyData = generateDailyForecast()

const aiInsights = [
  {
    icon: Thermometer,
    title: 'Temperature Impact',
    description: 'Expected high of 32°C will increase cooling demand by 18% during afternoon hours',
    impact: '+450 MW',
    color: 'text-destructive'
  },
  {
    icon: Users,
    title: 'Industrial Activity',
    description: 'Manufacturing sector showing 12% higher consumption patterns this week',
    impact: '+280 MW',
    color: 'text-[oklch(0.75_0.18_60)]'
  },
  {
    icon: Calendar,
    title: 'Scheduled Events',
    description: 'Stadium event on Friday expected to cause localized demand spike',
    impact: '+120 MW',
    color: 'text-primary'
  },
  {
    icon: Cloud,
    title: 'Weather Outlook',
    description: 'Clear skies forecasted - optimal conditions for solar generation',
    impact: '+350 MW',
    color: 'text-accent'
  }
]

export default function ForecastPage() {
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week'>('hour')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Brain className="w-7 h-7 text-primary" />
            AI Demand Forecast
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Machine learning powered demand predictions and analysis
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border/50">
          {[
            { value: 'hour', label: 'Next Hour', icon: Clock },
            { value: 'day', label: 'Next Day', icon: Calendar },
            { value: 'week', label: 'Next Week', icon: Calendar }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value as typeof timeframe)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                timeframe === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <option.icon className="w-4 h-4" />
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Forecast Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-panel rounded-xl p-6 border border-primary/30 glow-blue"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Demand Prediction Model
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              AI confidence: 94.2% | Model: GridPredict v3.1
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Predicted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Actual
              </span>
            </div>
          </div>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
              <XAxis 
                dataKey="time" 
                stroke="oklch(0.65 0.02 250)"
                tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                tickLine={false}
              />
              <YAxis 
                stroke="oklch(0.65 0.02 250)"
                tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
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
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="oklch(0.7 0.18 200)"
                strokeWidth={2}
                fill="url(#predictedGradient)"
                name="Predicted (MW)"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="oklch(0.75 0.2 160)"
                strokeWidth={2}
                fill="url(#actualGradient)"
                name="Actual (MW)"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-xl p-6 border border-border/50"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Weekly Demand Forecast
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                <XAxis 
                  dataKey="day" 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(0.15 0.02 250 / 0.9)',
                    border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-rajdhani)'
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-rajdhani)', fontSize: '12px' }} />
                <Bar dataKey="peak" fill="oklch(0.7 0.18 200)" name="Peak" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted" fill="oklch(0.75 0.2 160)" name="Average" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" fill="oklch(0.5 0.1 200)" name="Low" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-xl p-6 border border-border/50"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <Brain className="w-5 h-5 text-primary" />
            AI Analysis Factors
          </h3>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <insight.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {insight.title}
                    </h4>
                    <span className={`text-sm font-bold ${insight.color}`} style={{ fontFamily: 'var(--font-heading)' }}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {insight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Peak Prediction Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-accent/30"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/30">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Peak Demand Prediction
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Expected today at 6:00 PM based on historical patterns and current conditions
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
              3,450 MW
            </div>
            <div className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              +8.2% vs yesterday
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
