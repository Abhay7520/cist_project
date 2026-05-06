"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, TrendingDown, Battery, Gauge } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { LiveChart } from '@/components/dashboard/live-chart'
import { GridStatus } from '@/components/dashboard/grid-status'
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel'
import { AlertsWidget } from '@/components/dashboard/alerts-widget'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    demand: 2847,
    supply: 3012,
    renewable: 42,
    efficiency: 94.2
  })
  
  const [liveMetrics, setLiveMetrics] = useState({
    frequency: 50.02,
    voltage: 230.5
  })
  
  const [location, setLocation] = useState("Loading...")
  const [mounted, setMounted] = useState(false)

  // Fetch real-time updates from backend
  useEffect(() => {
    setMounted(true)

    const fetchDashboardSummary = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/dashboard-summary")
        if (res.ok) {
          const data = await res.json()
          if (!data.error) {
            setStats({
              demand: Math.round(data.demand),
              supply: Math.round(data.supply),
              renewable: data.renewable,
              efficiency: data.efficiency
            })
            setLocation(data.location)
            
            // Generate live metrics only on client
            setLiveMetrics({
              frequency: 50 + (Math.random() * 0.1 - 0.05),
              voltage: 230 + (Math.random() * 2 - 1)
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard summary:", err)
      }
    }

    fetchDashboardSummary()
    const interval = setInterval(fetchDashboardSummary, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            Control Dashboard
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Real-time grid monitoring • <span className="text-primary font-semibold">{location}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
          <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Last sync:
          </span>
          <span className="text-sm text-foreground font-medium" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            {mounted ? new Date().toLocaleTimeString() : ''}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Demand"
          value={stats.demand}
          unit="MW"
          change={2.4}
          icon={TrendingUp}
          color="blue"
          subtitle="Based on historical sampling"
        />
        <StatCard
          title="Power Supply"
          value={stats.supply}
          unit="MW"
          change={1.2}
          icon={Zap}
          color="green"
          subtitle="Generated capacity"
        />
        <StatCard
          title="Renewable Mix"
          value={stats.renewable.toFixed(1)}
          unit="%"
          change={5.8}
          icon={Battery}
          color="green"
          subtitle="Solar & Wind contribution"
        />
        <StatCard
          title="Grid Efficiency"
          value={stats.efficiency.toFixed(1)}
          unit="%"
          change={-0.3}
          icon={Gauge}
          color="blue"
          subtitle="System performance"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <LiveChart />
        </div>

        {/* Grid Status */}
        <div>
          <GridStatus 
            status={stats.demand / stats.supply > 0.9 ? 'critical' : stats.demand / stats.supply > 0.8 ? 'warning' : 'stable'} 
            frequency={liveMetrics.frequency} 
            voltage={liveMetrics.voltage} 
            load={Math.round((stats.demand / stats.supply) * 100)} 
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightsPanel />
        <AlertsWidget />
      </div>

      {/* Energy Flow Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-xl p-6 border border-border/50"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Energy Distribution Network
        </h3>
        <div className="relative h-32 overflow-hidden rounded-lg bg-secondary/20">
          <div className="absolute inset-0 flex items-center justify-between px-8">
            {/* Generation */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mx-auto mb-2">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Generation
              </span>
              <div className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {stats.supply.toLocaleString()} MW
              </div>
            </div>

            {/* Flow Line */}
            <div className="flex-1 mx-4 relative h-1">
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-primary rounded-full" />
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 -translate-y-1/2 w-8 h-3 bg-white/30 rounded-full blur-sm"
              />
            </div>

            {/* Transmission */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Transmission
              </span>
              <div className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {Math.round(stats.supply * 0.98).toLocaleString()} MW
              </div>
            </div>

            {/* Flow Line */}
            <div className="flex-1 mx-4 relative h-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 w-8 h-3 bg-white/30 rounded-full blur-sm"
              />
            </div>

            {/* Distribution */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center mx-auto mb-2">
                <TrendingDown className="w-8 h-8 text-primary/70" />
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Distribution
              </span>
              <div className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {stats.demand.toLocaleString()} MW
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
