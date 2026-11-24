"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/lib/api-config'
import { useGridMind } from '@/lib/gridmind-context'
import { Map, Zap, AlertTriangle, CheckCircle2, X, Activity, Gauge, ThermometerSun, Loader2, Info, Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Substation {
  id: string
  name: string
  circle: string
  division: string
  subdivision: string
  x: number
  y: number
  status: 'normal' | 'warning' | 'critical'
  measured_load_kw: number
  forecast_load_kw: number
  forecast_time_range: string
  capacity_kw: number | null
  load_percentage: number | null
  load_type: string
  regional_aggregate_kw: number
  electrical_connectivity: string
  connectivity_note: string
  connections: string[]
  timestamp: string
}

const statusConfig = {
  normal: {
    color: 'bg-accent',
    glow: 'shadow-[0_0_15px_oklch(0.75_0.2_160)]',
    border: 'border-accent',
    text: 'text-accent',
    fill: 'oklch(0.75 0.2 160)'
  },
  warning: {
    color: 'bg-[oklch(0.75_0.18_60)]',
    glow: 'shadow-[0_0_15px_oklch(0.75_0.18_60)]',
    border: 'border-[oklch(0.75_0.18_60)]',
    text: 'text-[oklch(0.75_0.18_60)]',
    fill: 'oklch(0.75 0.18 60)'
  },
  critical: {
    color: 'bg-destructive',
    glow: 'shadow-[0_0_15px_oklch(0.6_0.22_25)]',
    border: 'border-destructive',
    text: 'text-destructive',
    fill: 'oklch(0.6 0.22 25)'
  }
}

export default function GridMapPage() {
  const { setSelectedLocationId } = useGridMind()
  const [substations, setSubstations] = useState<Substation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStation, setSelectedStation] = useState<Substation | null>(null)
  const [hoveredStation, setHoveredStation] = useState<string | null>(null)
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('all')

  useEffect(() => {
    const fetchSubstations = async () => {
      try {
        const res = await fetch(`${API_URL}/sections-data`)
        if (!res.ok) throw new Error('Failed to fetch sections data')
        const data = await res.json()
        setSubstations(data)
        // Select first by default
        if (data.length > 0) {
          setSelectedStation(data[0])
        }
      } catch (err) {
        console.error('Error fetching substations:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubstations()
  }, [])

  const circles = ['all', ...Array.from(new Set(substations.map(s => s.circle)))]

  const filteredSubstations = selectedCircleFilter === 'all'
    ? substations
    : substations.filter(s => s.circle === selectedCircleFilter)
  const stationsOnRing = substations.map((station, index) => {
    const angle = (index / substations.length) * 2 * Math.PI - Math.PI / 2

    return {
      ...station,
      x: 50 + 36 * Math.cos(angle),
      y: 50 + 36 * Math.sin(angle),
    }
  })

  const visibleStations = stationsOnRing.filter(station =>
    filteredSubstations.some(visible => visible.id === station.id)
  )

  const getSubstationById = (id: string) =>
    visibleStations.find(station => station.id === id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold flex items-center gap-1">
              <Map className="w-3 h-3" /> Distribution Node Topology
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground border border-border/50">
              Administrative Grouping (No Fabricated Links)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Grid Distribution Substation Map
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Geographical distribution nodes, verified transformer capacities, and measured vs forecast loading
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50">
          {[
            { status: 'normal', label: 'Normal (<85%)' },
            { status: 'warning', label: 'High Load (≥85%)' },
            { status: 'critical', label: 'Overloaded (>100%)' }
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusConfig[item.status as keyof typeof statusConfig].color}`} />
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Prominent Architectural Truth Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-blue-400" style={{ fontFamily: 'var(--font-heading)' }}>
            Electrical Connectivity Unavailable — Administrative Division Representation
          </p>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            The TGSPDCL dataset does not document physical transmission or feeder interconnect records between substations. Substations belonging to the same administrative division do not necessarily share direct electrical connections; synthetic interconnect lines have been intentionally removed to preserve physical truthfulness.
          </p>
        </div>
      </motion.div>

      {/* Map & Detail Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 glass-panel rounded-xl p-6 border border-primary/30 relative overflow-hidden flex flex-col justify-between"
          style={{ minHeight: '620px' }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 grid-background opacity-25 pointer-events-none" />

          {/* Filter Bar overlay */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border/60">
              <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>Filter Circle:</span>
              <select
                value={selectedCircleFilter}
                onChange={(e) => setSelectedCircleFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-primary outline-none cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {circles.map(c => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c === 'all' ? 'All Circles' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border/60">
              <span className="text-xs text-muted-foreground">Showing:</span>
              <span className="text-xs font-bold text-foreground font-mono">{filteredSubstations.length} Substations</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>Loading distribution nodes...</p>
            </div>
          ) : (
            <div className="relative flex-1 w-full h-[450px]">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.75 0.2 160)" />
                    <stop offset="100%" stopColor="oklch(0.6 0.2 250)" />
                  </linearGradient>
                </defs>

                {/* Draw connections first */}
                {visibleStations.map((station) =>
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
                {/* Decorative lines for the schematic map */}
                <g pointerEvents="none" aria-hidden="true">
                  {visibleStations.map((station, index) => {
                    const target = visibleStations[(index + 3) % visibleStations.length]

                    return (
                      <g key={`schematic-${station.id}`}>
                        <line
                          x1={50} y1={50} x2={station.x} y2={station.y}
                          stroke="#00b8cf" strokeWidth={0.18} strokeOpacity={0.4}
                          strokeDasharray="1 1"
                        />
                        {visibleStations.length > 3 && (
                          <line
                            x1={station.x} y1={station.y} x2={target.x} y2={target.y}
                            stroke="#00b8cf" strokeWidth={0.18} strokeOpacity={0.3}
                          />
                        )}
                      </g>
                    )
                  })}
                </g>
                <text x="3" y="6" fill="#94a3b8" fontSize="2.2">
                  City Power Grid Network · Schematic
                </text>
                {/* Central Hub */}
                <g className="cursor-pointer" onClick={() => setSelectedStation(null)}>
                  <circle cx="50" cy="50" r="5" fill="oklch(0.75 0.2 160 / 0.15)" filter="url(#glow)" />
                  <circle cx="50" cy="50" r="3" fill="url(#coreGradient)" stroke="white" strokeWidth="0.5" />
                  <text x="50" y="58" textAnchor="middle" fill="oklch(0.75 0.2 160)" fontSize="3" fontWeight="bold" fontFamily="var(--font-heading)">GRID CORE</text>
                </g>

                {/* Draw substations */}
                {visibleStations.map((station) => {
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
            </div>
          )}

          {/* Map Footer Metadata Overlay */}
          <div className="relative z-10 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold uppercase tracking-wider text-[11px]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Historical Snapshot Telemetry (Live SCADA: Unavailable)
              </span>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              <span>Topology Model: Isolated Nodes by Division</span>
            </div>
          </div>
        </motion.div>

        {/* Station Detail Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-xl border border-border/50 flex flex-col justify-between overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {selectedStation ? (
              <motion.div
                key={selectedStation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-5 flex-1 flex flex-col"
              >
                {/* Station Header */}
                <div className={`p-4 border-b ${statusConfig[selectedStation.status].border} bg-gradient-to-r from-secondary/50 to-transparent`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">
                          {selectedStation.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold text-white ${statusConfig[selectedStation.status].color}`}>
                          {selectedStation.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                        {selectedStation.name}
                      </h3>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {selectedStation.timestamp}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Administrative Hierarchy */}
                <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/40 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Building2 className="w-4 h-4 text-primary" />
                    Administrative Organization
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    <div>
                      <span className="text-muted-foreground">Circle: </span>
                      <span className="font-semibold text-foreground">{selectedStation.circle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Division: </span>
                      <span className="font-semibold text-foreground">{selectedStation.division}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subdivision: </span>
                      <span className="font-semibold text-foreground">{selectedStation.subdivision}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Section: </span>
                      <span className="font-semibold text-foreground">{selectedStation.id}</span>
                    </div>
                  </div>
                </div>

                {/* Loading Statistics (Separating Node from Regional Aggregate) */}
                <div className="space-y-3">
                  {/* Metric 1: Node Measured Load */}
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-accent" />
                        [Measured Node Load]
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono">
                        {selectedStation.measured_load_kw?.toLocaleString() ?? '0'} kW
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Discrete load measured at this substation section
                    </p>
                  </div>

                  {/* Metric 2: Upcoming Model Forecast */}
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        [Model Forecast ({selectedStation.forecast_time_range})]
                      </span>
                      <span className="text-sm font-bold text-primary font-mono">
                        {selectedStation.forecast_load_kw?.toLocaleString() ?? '0'} kW
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Weather-aware XGBoost demand prediction
                    </p>
                  </div>

                  {/* Metric 3: Regional Aggregate Load */}
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        [Regional Aggregate Load]
                      </span>
                      <span className="text-sm font-bold text-amber-400 font-mono">
                        {selectedStation.regional_aggregate_kw?.toLocaleString() ?? '0'} kW
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Sum of all sections in {selectedStation.circle} Circle (Distinct from this single node)
                    </p>
                  </div>

                  {/* Substation Verified Capacity Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Transformer Capacity:
                      </span>
                      <span className="font-bold text-foreground font-mono">
                        {selectedStation.capacity_kw != null
                          ? `${selectedStation.capacity_kw.toLocaleString()} kW (${selectedStation.load_percentage}%)`
                          : 'Not Documented (Gap)'}
                      </span>
                    </div>
                    {selectedStation.capacity_kw !== null ? (
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, selectedStation.load_percentage || 0)}%` }}
                          className={`h-full rounded-full ${statusConfig[selectedStation.status].color}`}
                        />
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/30">
                        ⚠️ Nameplate capacity limit not documented for this node.
                      </div>
                    )}
                  </div>
                </div>

                {/* Electrical Connectivity Disclosure */}
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                    Electrical Connectivity: Unavailable
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {selectedStation.connectivity_note}
                  </p>
                </div>

                {/* Direct Action Bridge to Forecast / Predict */}
                <div className="pt-2">
                  <Link
                    href="/dashboard/forecast"
                    onClick={() => {
                      const mappedId = selectedStation.id.toLowerCase()
                      setSelectedLocationId(mappedId)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    Load into AI Forecast Page
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm flex-1 flex flex-col items-center justify-center">
                <Map className="w-8 h-8 text-muted-foreground mb-2" />
                Select a substation on the map to inspect its data.
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Verified Substations', value: substations.length, icon: Zap, color: 'text-primary' },
          { label: 'Substations in High Load (≥85%)', value: substations.filter(s => s.status === 'warning').length, icon: AlertTriangle, color: 'text-[oklch(0.75_0.18_60)]' },
          { label: 'Data Provenance Standard', value: 'TGSPDCL Snapshot (No Fake Links)', icon: CheckCircle2, color: 'text-accent' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-xl p-4 border border-border/50 flex items-center gap-4"
          >
            <div className="p-2.5 rounded-lg bg-secondary/50">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {stat.label}
              </p>
              <p className="text-xl font-bold text-foreground mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
