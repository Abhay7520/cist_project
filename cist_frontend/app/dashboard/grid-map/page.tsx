"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/lib/api-config'
import { Map, Zap, AlertTriangle, CheckCircle2, X, Activity, Gauge, ThermometerSun, Loader2 } from 'lucide-react'

interface Substation {
  id: string
  name: string
  x: number
  y: number
  status: 'normal' | 'warning' | 'critical'
  load: number
  capacity: number
  voltage: number
  temperature: number
  connections: string[]
}


const statusConfig = {
  normal: { color: 'bg-accent', glow: 'shadow-[0_0_15px_oklch(0.75_0.2_160)]', border: 'border-accent', text: 'text-accent' },
  warning: { color: 'bg-[oklch(0.75_0.18_60)]', glow: 'shadow-[0_0_15px_oklch(0.75_0.18_60)]', border: 'border-[oklch(0.75_0.18_60)]', text: 'text-[oklch(0.75_0.18_60)]' },
  critical: { color: 'bg-destructive', glow: 'shadow-[0_0_15px_oklch(0.6_0.22_25)]', border: 'border-destructive', text: 'text-destructive' }
}

export default function GridMapPage() {
  
  const [substations, setSubstations] = useState<Substation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<Substation | null>(null)
  const [hoveredStation, setHoveredStation] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubstations = async () => {
      try {
        const res = await fetch(`${API_URL}/sections-data`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setSubstations(data)
      } catch (err) {
        console.error('Error fetching substations:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubstations()
  }, [])

  const getSubstationById = (id: string) => substations.find(s => s.id === id)

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
            <Map className="w-7 h-7 text-primary" />
            Grid Monitoring Map
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Interactive visualization of power grid infrastructure
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
          {[
            { status: 'normal', label: 'Normal' },
            { status: 'warning', label: 'Warning' },
            { status: 'critical', label: 'Critical' }
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig[item.status as keyof typeof statusConfig].color}`} />
              <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 glass-panel rounded-xl p-6 border border-primary/30 relative overflow-hidden"
          style={{ minHeight: '600px' }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 grid-background opacity-30" />
          
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse" style={{ fontFamily: 'var(--font-rajdhani)' }}>Syncing with Grid Core...</p>
            </div>
          ) : (
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(0.75 0.2 160)" />
                  <stop offset="100%" stopColor="oklch(0.6 0.2 250)" />
                </linearGradient>
              </defs>

              {/* Draw connections first */}
              {substations.map((station) =>
                station.connections.map((connId) => {
                  const target = getSubstationById(connId)
                  if (!target) return null
                  
                  const isHighlighted = hoveredStation === station.id || hoveredStation === connId
                  const lineStatus = station.status === 'critical' || target.status === 'critical' 
                    ? 'critical' 
                    : station.status === 'warning' || target.status === 'warning'
                      ? 'warning'
                      : 'normal'
                  
                  return (
                    <g key={`${station.id}-${connId}`}>
                      <line
                        x1={station.x}
                        y1={station.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={
                          lineStatus === 'critical' ? 'oklch(0.6 0.22 25)' :
                          lineStatus === 'warning' ? 'oklch(0.75 0.18 60)' :
                          'oklch(0.7 0.18 200)'
                        }
                        strokeWidth={isHighlighted ? 0.8 : 0.3}
                        strokeOpacity={isHighlighted ? 0.9 : 0.3}
                        className="transition-all duration-300"
                      />
                      {/* Animated data packets */}
                      <motion.circle
                        r="0.4"
                        fill="white"
                        initial={{ offsetDistance: '0%' }}
                        animate={{ offsetDistance: '100%' }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'linear' }}
                        style={{ offsetPath: `path('M${station.x},${target.y} L${target.x},${target.y}')` }}
                        className="pointer-events-none opacity-50"
                      />
                    </g>
                  )
                })
              )}

              {/* Connections to Hub */}
              {substations.map(s => (
                <line
                  key={`hub-${s.id}`}
                  x1="50" y1="50" x2={s.x} y2={s.y}
                  stroke="oklch(0.75 0.2 160)"
                  strokeWidth="0.2"
                  strokeOpacity="0.2"
                  strokeDasharray="1,1"
                />
              ))}
              
              {/* Central Hub */}
              <g className="cursor-pointer" onClick={() => setSelectedStation(null)}>
                <circle cx="50" cy="50" r="5" fill="oklch(0.75 0.2 160 / 0.15)" filter="url(#glow)" />
                <circle cx="50" cy="50" r="3" fill="url(#coreGradient)" stroke="white" strokeWidth="0.5" />
                <text x="50" y="58" textAnchor="middle" fill="oklch(0.75 0.2 160)" fontSize="3" fontWeight="bold" fontFamily="var(--font-heading)">GRID CORE</text>
              </g>
              
              {/* Draw substations */}
              {substations.map((station) => {
                const isSelected = selectedStation?.id === station.id
                const isHovered = hoveredStation === station.id
                
                return (
                  <g
                    key={station.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedStation(station)}
                    onMouseEnter={() => setHoveredStation(station.id)}
                    onMouseLeave={() => setHoveredStation(null)}
                  >
                    {/* Status Ring */}
                    <motion.circle
                      cx={station.x}
                      cy={station.y}
                      r={isSelected || isHovered ? 4.5 : 3.5}
                      fill="none"
                      stroke={
                        station.status === 'critical' ? 'oklch(0.6 0.22 25)' :
                        station.status === 'warning' ? 'oklch(0.75 0.18 60)' :
                        'oklch(0.75 0.2 160)'
                      }
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      className="opacity-60"
                    />
                    
                    {/* Main node */}
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r={isSelected ? 2.5 : 2}
                      fill={
                        station.status === 'critical' ? 'oklch(0.6 0.22 25)' :
                        station.status === 'warning' ? 'oklch(0.75 0.18 60)' :
                        'oklch(0.1 0.05 250)'
                      }
                      stroke={
                        station.status === 'normal' ? 'oklch(0.75 0.2 160)' : 'white'
                      }
                      strokeWidth={isSelected ? 0.8 : 0.4}
                      className="transition-all duration-200 shadow-xl"
                    />
                    
                    {/* Label (only if hovered or selected or zoomed) */}
                    {(isHovered || isSelected) && (
                      <g className="pointer-events-none">
                        <rect x={station.x - 10} y={station.y - 12} width="20" height="6" rx="1" fill="oklch(0.1 0.05 250 / 0.8)" stroke="oklch(0.75 0.2 160 / 0.4)" strokeWidth="0.2" />
                        <text
                          x={station.x}
                          y={station.y - 8}
                          textAnchor="middle"
                          fill="white"
                          fontSize="2.5"
                          fontFamily="var(--font-rajdhani)"
                          fontWeight="bold"
                        >
                          {station.id}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          )}
          
          {/* Map metadata overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Live Grid Feed Active
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase" style={{ fontFamily: 'var(--font-rajdhani)' }}>Network Load Intensity</p>
              <div className="h-1 w-24 bg-gradient-to-r from-accent via-[oklch(0.75_0.18_60)] to-destructive rounded-full mt-1" />
            </div>
          </div>

          {/* Map title overlay */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50">
            <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              City Power Grid Network
            </span>
          </div>
        </motion.div>

        {/* Station Details Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-xl border border-border/50 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {selectedStation ? (
              <motion.div
                key={selectedStation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Header */}
                <div className={`p-4 border-b ${statusConfig[selectedStation.status].border} bg-gradient-to-r from-secondary/50 to-transparent`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          {selectedStation.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[selectedStation.status].color} text-white uppercase`}>
                          {selectedStation.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                        {selectedStation.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedStation(null)}
                      className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 flex-1 space-y-4">
                  {/* Load */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        <Activity className="w-4 h-4" />
                        System Load
                      </span>
                      <span className={`font-medium ${statusConfig[selectedStation.status].text}`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {selectedStation.load}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedStation.load}%` }}
                        className={`h-full rounded-full ${statusConfig[selectedStation.status].color}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Capacity: {selectedStation.capacity} MW
                    </p>
                  </div>

                  {/* Voltage */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Voltage
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                      {selectedStation.voltage} V
                    </span>
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className={`w-4 h-4 ${selectedStation.temperature > 60 ? 'text-destructive' : 'text-accent'}`} />
                      <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Temperature
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${selectedStation.temperature > 60 ? 'text-destructive' : 'text-foreground'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                      {selectedStation.temperature}°C
                    </span>
                  </div>

                  {/* Connections */}
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Connected Substations
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedStation.connections.map((connId) => {
                        const conn = getSubstationById(connId)
                        if (!conn) return null
                        return (
                          <button
                            key={connId}
                            onClick={() => setSelectedStation(conn)}
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all hover:scale-105 ${statusConfig[conn.status].border} ${statusConfig[conn.status].text} bg-secondary/30`}
                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                          >
                            {connId}: {conn.name.split(' ')[0]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className={`p-4 border-t border-border/50 ${statusConfig[selectedStation.status].color}/10`}>
                  <div className="flex items-center gap-2">
                    {selectedStation.status === 'normal' ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${statusConfig[selectedStation.status].text}`} />
                    )}
                    <span className="text-sm" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {selectedStation.status === 'normal' 
                        ? 'Operating within normal parameters'
                        : selectedStation.status === 'warning'
                          ? 'Load approaching capacity limits'
                          : 'Immediate attention required'
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4">
                  <Map className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Select a Substation
                </h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Click on any node in the grid map to view detailed information and status
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Substations', value: substations.length, icon: Zap, color: 'text-primary' },
          { label: 'Warning Status', value: substations.filter(s => s.status === 'warning').length, icon: AlertTriangle, color: 'text-[oklch(0.75_0.18_60)]' },
          { label: 'Critical Status', value: substations.filter(s => s.status === 'critical').length, icon: AlertTriangle, color: 'text-destructive' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-xl p-4 border border-border/50 flex items-center gap-4"
          >
            <div className="p-2 rounded-lg bg-secondary/50">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
