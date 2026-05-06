"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Lightbulb, TrendingUp, AlertCircle, ChevronRight, Sparkles } from 'lucide-react'

interface Insight {
  id: number
  type: 'prediction' | 'recommendation' | 'alert'
  title: string
  description: string
  confidence?: number
}

const insights: Insight[] = [
  {
    id: 1,
    type: 'prediction',
    title: 'Demand Spike Expected',
    description: 'AI predicts 23% increase in demand at 6:00 PM due to temperature rise (32°C forecasted)',
    confidence: 94
  },
  {
    id: 2,
    type: 'recommendation',
    title: 'Optimize Power Sources',
    description: 'Recommend activating solar farm B to reduce grid stress during peak hours',
    confidence: 87
  },
  {
    id: 3,
    type: 'alert',
    title: 'Substation Load Warning',
    description: 'Substation #7 approaching 85% capacity. Consider load redistribution',
    confidence: 91
  },
  {
    id: 4,
    type: 'prediction',
    title: 'Weather Impact Analysis',
    description: 'Cloud cover expected to reduce solar generation by 15% tomorrow morning',
    confidence: 82
  }
]

const typeConfig = {
  prediction: {
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30'
  },
  recommendation: {
    icon: Lightbulb,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/30'
  },
  alert: {
    icon: AlertCircle,
    color: 'text-[oklch(0.75_0.18_60)]',
    bg: 'bg-[oklch(0.75_0.18_60)]/10',
    border: 'border-[oklch(0.75_0.18_60)]/30'
  }
}

export function AIInsightsPanel() {
  const [activeInsight, setActiveInsight] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInsight(prev => (prev + 1) % insights.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-6 border border-primary/30 glow-blue"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 10px rgba(56, 189, 248, 0.3)',
              '0 0 20px rgba(56, 189, 248, 0.5)',
              '0 0 10px rgba(56, 189, 248, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-2.5 rounded-lg bg-primary/10 border border-primary/30"
        >
          <Brain className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            AI Insights
            <Sparkles className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Powered by GridAI v2.4
          </p>
        </div>
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const config = typeConfig[insight.type]
          const Icon = config.icon
          const isActive = index === activeInsight

          return (
            <motion.div
              key={insight.id}
              initial={false}
              animate={{ 
                scale: isActive ? 1 : 0.98,
                opacity: isActive ? 1 : 0.6
              }}
              onClick={() => setActiveInsight(index)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                isActive 
                  ? `${config.bg} border ${config.border}` 
                  : 'bg-secondary/30 border border-transparent hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {insight.title}
                    </h4>
                    {insight.confidence && isActive && (
                      <span className="text-xs text-muted-foreground ml-2 shrink-0" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {insight.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground"
                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                      >
                        {insight.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isActive ? 'rotate-90' : ''}`} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {insights.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === activeInsight ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
            }`}
          />
        ))}
      </div>
    </motion.div>
  )
}
