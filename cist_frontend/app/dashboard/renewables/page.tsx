"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Wind, Droplets, Leaf, TrendingUp, Cloud, Zap, Battery } from 'lucide-react'
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
  Legend
} from 'recharts'

// Generate renewable generation data
const generateHourlyData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 0; i < 24; i++) {
    const hour = (now.getHours() - 23 + i + 24) % 24
    const isDaylight = hour >= 6 && hour <= 18
    
    // Solar peaks at noon
    const solarFactor = isDaylight ? Math.sin((hour - 6) / 12 * Math.PI) : 0
    const solar = Math.round(800 * solarFactor * (0.8 + Math.random() * 0.4))
    
    // Wind is more variable
    const wind = Math.round(300 + Math.random() * 400)
    
    // Hydro is relatively constant
    const hydro = Math.round(200 + Math.random() * 50)
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      solar,
      wind,
      hydro,
      total: solar + wind + hydro
    })
  }
  
  return data
}

const hourlyData = generateHourlyData()

const energyMix = [
  { name: 'Solar', value: 28, color: 'oklch(0.8 0.18 90)' },
  { name: 'Wind', value: 14, color: 'oklch(0.75 0.2 160)' },
  { name: 'Hydro', value: 8, color: 'oklch(0.7 0.18 200)' },
  { name: 'Natural Gas', value: 35, color: 'oklch(0.65 0.1 250)' },
  { name: 'Nuclear', value: 12, color: 'oklch(0.6 0.15 280)' },
  { name: 'Coal', value: 3, color: 'oklch(0.5 0.05 250)' }
]

const renewableSources = [
  {
    name: 'Solar Farm Alpha',
    type: 'solar',
    icon: Sun,
    capacity: 850,
    current: 680,
    status: 'optimal',
    efficiency: 94,
    location: 'Southern District'
  },
  {
    name: 'Wind Park Beta',
    type: 'wind',
    icon: Wind,
    capacity: 450,
    current: 320,
    status: 'good',
    efficiency: 78,
    location: 'Coastal Region'
  },
  {
    name: 'Solar Array Gamma',
    type: 'solar',
    icon: Sun,
    capacity: 420,
    current: 380,
    status: 'optimal',
    efficiency: 91,
    location: 'Eastern Plains'
  },
  {
    name: 'Hydro Station Delta',
    type: 'hydro',
    icon: Droplets,
    capacity: 280,
    current: 250,
    status: 'good',
    efficiency: 89,
    location: 'River Valley'
  }
]

const statusColors = {
  optimal: { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent' },
  good: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' },
  reduced: { bg: 'bg-[oklch(0.75_0.18_60)]/10', border: 'border-[oklch(0.75_0.18_60)]/30', text: 'text-[oklch(0.75_0.18_60)]' }
}

export default function RenewablesPage() {
  const [totalRenewable, setTotalRenewable] = useState(1630)
  const [renewablePercentage, setRenewablePercentage] = useState(50)
  const [energyMixData, setEnergyMixData] = useState(energyMix)
  const [sources, setSources] = useState(renewableSources)
  const [weather, setWeather] = useState({ temp: 32, humidity: 45, condition: 'Clear Sky' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/renewables-data')
        const data = await res.json()
        if (!data.error) {
          setTotalRenewable(data.total_renewable)
          setRenewablePercentage(data.renewable_percentage)
          setEnergyMixData(data.energy_mix)
          setSources(data.sources.map((s: any) => ({
            ...s,
            icon: s.type === 'solar' ? Sun : s.type === 'wind' ? Wind : Droplets
          })))
          setWeather(data.weather)
        }
      } catch (err) {
        console.error('Failed to fetch renewables data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000) // Refresh every 10s
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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
            <Leaf className="w-7 h-7 text-accent" />
            Renewable Energy Dashboard
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Real-time renewable generation monitoring and forecasting
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-accent/10 border border-accent/30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <Sun className="w-5 h-5 text-accent" />
          </motion.div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Total Renewable
            </div>
            <div className="text-lg font-bold text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
              {totalRenewable} MW
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Sun, label: 'Solar', value: '1,060 MW', change: '+12%', color: 'text-[oklch(0.8_0.18_90)]' },
          { icon: Wind, label: 'Wind', value: '320 MW', change: '+5%', color: 'text-accent' },
          { icon: Droplets, label: 'Hydro', value: '250 MW', change: '-2%', color: 'text-primary' },
          { icon: Battery, label: 'Storage', value: '85%', change: 'Charging', color: 'text-[oklch(0.65_0.15_280)]' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                    {stat.value}
                  </span>
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-accent' : stat.change.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 glass-panel rounded-xl p-6 border border-border/50"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Renewable Generation (24h)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.8 0.18 90)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.8 0.18 90)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.75 0.2 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hydroGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.04 250)" />
                <XAxis 
                  dataKey="time" 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="oklch(0.65 0.02 250)"
                  tick={{ fontSize: 10, fontFamily: 'var(--font-rajdhani)' }}
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
                <Area
                  type="monotone"
                  dataKey="solar"
                  stackId="1"
                  stroke="oklch(0.8 0.18 90)"
                  fill="url(#solarGradient)"
                  name="Solar (MW)"
                />
                <Area
                  type="monotone"
                  dataKey="wind"
                  stackId="1"
                  stroke="oklch(0.75 0.2 160)"
                  fill="url(#windGradient)"
                  name="Wind (MW)"
                />
                <Area
                  type="monotone"
                  dataKey="hydro"
                  stackId="1"
                  stroke="oklch(0.7 0.18 200)"
                  fill="url(#hydroGradient)"
                  name="Hydro (MW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Energy Mix Pie Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-xl p-6 border border-border/50"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Energy Mix
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={energyMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {energyMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, '']}
                  contentStyle={{
                    background: 'oklch(0.15 0.02 250 / 0.9)',
                    border: '1px solid oklch(0.7 0.18 200 / 0.3)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-rajdhani)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
              {renewablePercentage}%
            </div>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Renewable Energy
            </p>
          </div>
        </motion.div>
      </div>

      {/* Renewable Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-border/50"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Active Generation Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source, index) => {
            const status = source.status as keyof typeof statusColors
            const colors = statusColors[status] || statusColors.good
            const utilization = (source.current / source.capacity) * 100

            return (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <source.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {source.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{source.location}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} uppercase tracking-wider`}>
                    {source.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Output
                    </span>
                    <span className="text-foreground font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                      {source.current} / {source.capacity} MW
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${utilization}%` }}
                      className={`h-full rounded-full ${
                        source.type === 'solar' ? 'bg-[oklch(0.8_0.18_90)]' :
                        source.type === 'wind' ? 'bg-accent' : 'bg-primary'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Efficiency: {source.efficiency}%</span>
                    <span>{utilization.toFixed(1)}% utilization</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Weather Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border border-[oklch(0.8_0.18_90)]/30"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[oklch(0.8_0.18_90)]/10 border border-[oklch(0.8_0.18_90)]/30">
            <Cloud className="w-6 h-6 text-[oklch(0.8_0.18_90)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              Weather Forecast Impact
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {weather.condition} observed - current environmental parameters influencing generation
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Sun className="w-8 h-8 text-[oklch(0.8_0.18_90)] mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">{weather.condition}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[oklch(0.8_0.18_90)]" style={{ fontFamily: 'var(--font-heading)' }}>
                {weather.temp}°C
              </div>
              <div className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Humidity: {weather.humidity}%
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
