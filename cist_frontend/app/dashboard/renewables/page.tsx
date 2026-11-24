"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Wind, Droplets, Leaf, TrendingUp, Cloud, Zap, Battery, AlertTriangle, Info, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'
import { API_URL } from '@/lib/api-config'
import { useGridMind } from '@/lib/gridmind-context'
import { VERIFIED_LOCATIONS_LIST } from '@/lib/location-catalog'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'
import Link from 'next/link'

interface AlignedInterval {
  time: string
  demandKw: number
  solarKw: number | null
  netDemandKw: number | null
  isDaylight: boolean
  demandStatus: string
  solarStatus: string
  netStatus: string
}

interface RenewablesResponse {
  location_id: string
  location_name: string
  documented_solar_capacity_kw: number | null
  current_solar_generation_kw: number | null
  current_demand_kw: number
  current_net_demand_kw: number | null
  renewable_status: 'available' | 'unavailable'
  net_demand_status: 'available' | 'unavailable'
  has_battery: boolean
  aligned_intervals: AlignedInterval[]
  energy_mix: { name: string; value: number; color: string }[]
  shifting_recommendation: string
  data_provenance: {
    capacity_source: string
    generation_model: string
    live_scada_connected: boolean
  }
}

export default function RenewablesPage() {
  const { selectedLocationId, setSelectedLocationId, selectedLocation } = useGridMind()
  
  const [data, setData] = useState<RenewablesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/renewables-data?location_id=${selectedLocationId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch renewable data`)
        const json = await res.json()
        if (!isCancelled) {
          setData(json)
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to fetch renewables data:', err)
          setError(err.message || 'Error communicating with backend service')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      isCancelled = true
    }
  }, [selectedLocationId])

  const documentedSolar = data?.documented_solar_capacity_kw ?? 0
  const hasSolar = data?.renewable_status === 'available' && documentedSolar > 0
  const currentGen = data?.current_solar_generation_kw ?? 0
  const currentDemand = data?.current_demand_kw ?? 0
  const currentNet = data?.current_net_demand_kw

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
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Synchronized Clean Energy
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground border border-border/50">
              [Model & Historical Capacity]
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Sun className="w-7 h-7 text-accent" />
            Renewable Integration & Net Demand
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Shared location monitoring: solar generation dispatch, verified installed capacity, and net demand offset
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-3 glass-panel p-2.5 rounded-xl border border-border/60">
          <MapPin className="w-5 h-5 text-accent shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Distribution Node</span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="bg-transparent text-sm font-bold text-foreground border-none outline-none cursor-pointer pr-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {VERIFIED_LOCATIONS_LIST.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-card text-foreground">
                  {loc.name} ({loc.circle}) {loc.documentedSolarCapacityKw && loc.documentedSolarCapacityKw > 0 ? `☀️ ${loc.documentedSolarCapacityKw} kW` : '⚠️ No Solar'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Missing Renewables State for Locations without Solar */}
      {!hasSolar && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 flex items-start gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-500 text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
              Renewable Generation Unavailable: No Verified Solar Capacity for {selectedLocation.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              The TGSPDCL asset records for section <strong>{selectedLocation.section}</strong> ({selectedLocation.circle}) do not document any registered grid-tied solar photovoltaic or wind installations. Net demand calculation requires concurrent demand and renewable feeds, so net grid demand defaults to gross demand.
            </p>
          </div>
        </motion.div>
      )}

      {/* Key Metric Cards: Separating Installed Capacity from Interval Generation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Documented Installed Capacity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-4 border border-border/50 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[oklch(0.8_0.18_90)]/15 border border-[oklch(0.8_0.18_90)]/30">
              <Sun className="w-5 h-5 text-[oklch(0.8_0.18_90)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Documented Installed Capacity
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {hasSolar ? `${documentedSolar.toLocaleString()} kW` : '0.0 kW'}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  [Verified Nameplate]
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/30 pt-1.5">
            {hasSolar ? 'Registered grid-tied solar photovoltaic installation' : 'No solar assets registered in TGSPDCL catalog'}
          </p>
        </motion.div>

        {/* Card 2: Current Interval Forecast Generation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/15 border border-accent/30">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Current Interval Generation
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                  {hasSolar && currentGen !== null ? `${currentGen.toFixed(1)} kW` : 'Unavailable'}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  [Forecast Output]
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/30 pt-1.5">
            {hasSolar ? `Irradiance-driven instantaneous output for current hour` : 'Solar generation feed unavailable'}
          </p>
        </motion.div>

        {/* Card 3: Gross Feeder Demand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/30">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Gross Feeder Demand
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {currentDemand.toFixed(1)} kW
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  [Forecast Demand]
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/30 pt-1.5">
            Weather-aware gross demand prediction
          </p>
        </motion.div>

        {/* Card 4: Net Grid Demand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-4 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${hasSolar ? 'bg-[oklch(0.7_0.18_200)]/15 border border-[oklch(0.7_0.18_200)]/30' : 'bg-secondary/40'}`}>
              <Battery className={`w-5 h-5 ${hasSolar ? 'text-[oklch(0.7_0.18_200)]' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Net Grid Demand
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  {currentNet !== null && currentNet !== undefined ? `${currentNet.toFixed(1)} kW` : `${currentDemand.toFixed(1)} kW`}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {hasSolar ? '[Calculated Net]' : '[Gross Only]'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/30 pt-1.5">
            {hasSolar 
              ? `Solar offsets ${currentDemand > 0 ? ((currentGen / currentDemand) * 100).toFixed(1) : 0}% of current gross demand`
              : 'Net demand equals gross demand (No solar offset)'}
          </p>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Aligned Interval Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 glass-panel rounded-xl p-6 border border-border/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Aligned 24-Hour Interval Profile
              </h3>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Synchronized Gross Demand [Forecast], Solar Generation [Forecast], and Net Demand [Calculated]
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-primary/20 text-primary font-mono">Demand</span>
              {hasSolar && <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-mono">Solar</span>}
              <span className="px-2 py-1 rounded bg-accent/20 text-accent font-mono">Net Grid</span>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.aligned_intervals || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.8 0.18 90)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.8 0.18 90)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                <XAxis 
                  dataKey="time" 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                />
                <YAxis 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)' }}
                  unit=" kW"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as AlignedInterval
                      return (
                        <div className="p-3 rounded-lg border border-primary/30 bg-card/95 backdrop-blur-md shadow-xl text-xs space-y-1">
                          <p className="font-bold text-foreground border-b border-border/40 pb-1">{label} Interval</p>
                          <p className="text-primary font-mono">Gross Demand: {item.demandKw} kW [Forecast]</p>
                          {item.solarKw !== null ? (
                            <p className="text-amber-400 font-mono">Solar Output: {item.solarKw} kW [Forecast]</p>
                          ) : (
                            <p className="text-muted-foreground font-mono">Solar Output: Unavailable</p>
                          )}
                          {item.netDemandKw !== null ? (
                            <p className="text-accent font-bold font-mono">Net Demand: {item.netDemandKw} kW [Calculated Net]</p>
                          ) : (
                            <p className="text-muted-foreground font-mono">Net Demand: Unavailable</p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'var(--font-rajdhani)', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="demandKw"
                  stroke="oklch(0.7 0.18 200)"
                  strokeWidth={2}
                  fill="url(#demandGrad)"
                  name="Gross Demand (kW)"
                />
                {hasSolar && (
                  <Area
                    type="monotone"
                    dataKey="solarKw"
                    stroke="oklch(0.8 0.18 90)"
                    strokeWidth={2}
                    fill="url(#solarGrad)"
                    name="Solar Generation (kW)"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="netDemandKw"
                  stroke="oklch(0.75 0.2 160)"
                  strokeWidth={2}
                  strokeDasharray={hasSolar ? undefined : "4 4"}
                  fill="url(#netGrad)"
                  name="Net Grid Demand (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Energy Mix & Load Shifting Advisory */}
        <div className="space-y-6">
          {/* Energy Mix */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-xl p-6 border border-border/50"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Generation Mix
            </h3>
            <p className="text-xs text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Distribution supply composition for {selectedLocation.name}
            </p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.energy_mix || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(data?.energy_mix || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Share']}
                    contentStyle={{
                      background: 'oklch(0.15 0.02 250 / 0.95)',
                      border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-rajdhani)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(data?.energy_mix || []).map((m) => (
                <div key={m.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-muted-foreground truncate">{m.name}:</span>
                  <span className="font-bold text-foreground">{m.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Load Shifting Advisory Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-xl p-5 border border-accent/40 bg-accent/5"
          >
            <div className="flex items-center gap-2 mb-2 text-accent font-bold text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
              <Sun className="w-4 h-4" />
              Operational Shifting Advisory
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {data?.shifting_recommendation || 'Analyzing generation windows...'}
            </p>
            <div className="mt-3 pt-3 border-t border-accent/20 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Optimal Solar Window:</span>
              <span className="font-bold text-accent font-mono">{hasSolar ? '11:00 – 14:00' : 'N/A'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Data Provenance & Model Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-5 border border-border/50 text-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <Info className="w-4 h-4 text-primary" />
              Renewables & Data Provenance Notice
            </h4>
            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Capacity limit source: <strong>TGSPDCL Historical Asset Inventory</strong> | Generation curve: <strong>Solar Irradiance Physical Clear-Sky Model</strong> | Live SCADA: <strong>Unavailable (Telemetry Gap)</strong>
            </p>
          </div>
          <Link
            href="/dashboard/predict"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-bold border border-primary/30 transition-all shrink-0"
            style={{ fontFamily: 'var(--font-rajdhani)' }}
          >
            Bridge to Predict Load
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
